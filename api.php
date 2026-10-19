<?php
declare(strict_types=1);

require_once __DIR__ . '/kapcsolat.php';

$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
// The options-array form is only supported by PHP 7.3 and newer.
session_set_cookie_params(0, '/; samesite=Lax', '', $isHttps, true);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(array $data, int $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body(): array {
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : $_POST;
}

function requireCsrf(): void {
    $given = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $given)) {
        respond(['error' => 'Lejárt munkamenet. Frissítsd az oldalt, és próbáld újra.'], 419);
    }
}

function userId(): int {
    return (int)($_SESSION['user_id'] ?? 0);
}

function requireLogin(): int {
    if (!userId()) respond(['error' => 'A funkció használatához jelentkezz be.'], 401);
    return userId();
}

function requireAdmin(): int {
    $id = requireLogin();
    global $kapcsolat;
    $query = $kapcsolat->prepare('SELECT admin FROM felhasznalok WHERE id = ?');
    $query->execute([$id]);
    if (!(int)$query->fetchColumn()) respond(['error' => 'Ehhez az oldalhoz admin jogosultság szükséges.'], 403);
    return $id;
}

function adminScope(int $id): string {
    global $kapcsolat;
    $query = $kapcsolat->prepare('SELECT admin_scope FROM felhasznalok WHERE id = ? AND admin = 1');
    $query->execute([$id]);
    $scope = $query->fetchColumn();
    if (!in_array($scope, ['all', 'toth_zoltan', 'lindner_szabolcs'], true)) {
        respond(['error' => 'Az admin jogosultsági hatóköre érvénytelen.'], 403);
    }
    return $scope;
}

function cleanString($value, int $max): string {
    $value = trim((string)$value);
    if ($value === '' || mb_strlen($value) > $max) respond(['error' => 'Ellenőrizd a megadott adatokat.'], 422);
    return $value;
}

$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET' && $action === 'csrf') {
        if (!isset($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        respond(['csrf' => $_SESSION['csrf']]);
    }

    if ($method === 'GET' && $action === 'me') {
        if (!userId()) respond(['user' => null]);
        $query = $kapcsolat->prepare('SELECT id, nev AS name, email, admin FROM felhasznalok WHERE id = ?');
        $query->execute([userId()]);
        respond(['user' => $query->fetch() ?: null]);
    }

    if ($method === 'GET' && $action === 'availability') {
        $staff = (string)($_GET['staff_id'] ?? '');
        $date = (string)($_GET['date'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) respond(['error' => 'Hibás dátum.'], 422);
        $query = $kapcsolat->prepare('SELECT TIME_FORMAT(idopont, "%H:%i") AS time FROM foglalasok WHERE szakember_id = ? AND datum = ?');
        $query->execute([$staff, $date]);
        respond(['booked' => array_column($query->fetchAll(), 'time')]);
    }

    if ($method === 'GET' && $action === 'reviews') {
        $staff = (string)($_GET['staff_id'] ?? '');
        $query = $kapcsolat->prepare('SELECT id, nev AS name, szoveg AS text, DATE_FORMAT(letrehozva, "%Y-%m-%d") AS date FROM velemenyek WHERE szakember_id = ? ORDER BY id DESC');
        $query->execute([$staff]);
        respond(['reviews' => $query->fetchAll()]);
    }

    if ($method === 'GET' && $action === 'availability_month') {
        $staff = (string)($_GET['staff_id'] ?? '');
        $month = (string)($_GET['month'] ?? '');
        if (!in_array($staff, ['toth_zoltan', 'juhasz_gabor', 'lindner_szabolcs'], true) || !preg_match('/^\d{4}-\d{2}$/', $month)) respond(['error' => 'Hibás naptári kérés.'], 422);
        $query = $kapcsolat->prepare('SELECT DATE_FORMAT(datum, "%Y-%m-%d") AS date, TIME_FORMAT(idopont, "%H:%i") AS time FROM foglalasok WHERE szakember_id = ? AND DATE_FORMAT(datum, "%Y-%m") = ?');
        $query->execute([$staff, $month]);
        $booked = [];
        foreach ($query->fetchAll() as $slot) $booked[$slot['date']][] = $slot['time'];
        respond(['booked' => $booked]);
    }

    if ($method === 'GET' && $action === 'bookings') {
        $id = requireLogin();
        $query = $kapcsolat->prepare('SELECT id, szakember_id AS staffId, szolgaltatas_nev AS serviceName, DATE_FORMAT(datum, "%Y-%m-%d") AS date, TIME_FORMAT(idopont, "%H:%i") AS time FROM foglalasok WHERE felhasznalo_id = ? ORDER BY datum, idopont');
        $query->execute([$id]);
        respond(['bookings' => $query->fetchAll()]);
    }

    if ($method === 'GET' && $action === 'car') {
        $id = requireLogin();
        $query = $kapcsolat->prepare('SELECT tipus AS type, rendszam AS plate FROM jarmuvek WHERE felhasznalo_id = ?');
        $query->execute([$id]);
        respond(['car' => $query->fetch() ?: null]);
    }

    if ($method === 'GET' && $action === 'order') {
        $code = (string)($_GET['code'] ?? '');
        $query = $kapcsolat->prepare('SELECT rendelesi_kod AS code, ertek AS amount, megajandekozott AS recipient, email, allapot AS status FROM utalvany_rendelesek WHERE rendelesi_kod = ?');
        $query->execute([$code]);
        $order = $query->fetch();
        if (!$order) respond(['error' => 'A rendelést nem találjuk.'], 404);
        respond(['order' => $order]);
    }

    if ($method === 'GET' && $action === 'admin_data') {
        $id = requireAdmin();
        $scope = adminScope($id);
        if ($scope === 'all') {
            $bookings = $kapcsolat->query('SELECT id, szakember_id AS staffId, szolgaltatas_nev AS serviceName, ugyfel_nev AS name, email, DATE_FORMAT(datum, "%Y-%m-%d") AS date, TIME_FORMAT(idopont, "%H:%i") AS time FROM foglalasok ORDER BY datum, idopont')->fetchAll();
            $reviews = $kapcsolat->query('SELECT id, szakember_id AS staffId, nev AS name, szoveg AS text, DATE_FORMAT(letrehozva, "%Y-%m-%d") AS date FROM velemenyek ORDER BY id DESC')->fetchAll();
            $orders = $kapcsolat->query('SELECT id, rendelesi_kod AS code, ertek AS amount, megajandekozott AS recipient, email, allapot AS status, DATE_FORMAT(letrehozva, "%Y-%m-%d") AS date FROM utalvany_rendelesek ORDER BY id DESC')->fetchAll();
        } else {
            $bookingsQuery = $kapcsolat->prepare('SELECT id, szakember_id AS staffId, szolgaltatas_nev AS serviceName, ugyfel_nev AS name, email, DATE_FORMAT(datum, "%Y-%m-%d") AS date, TIME_FORMAT(idopont, "%H:%i") AS time FROM foglalasok WHERE szakember_id = ? ORDER BY datum, idopont');
            $bookingsQuery->execute([$scope]);
            $bookings = $bookingsQuery->fetchAll();
            $reviewsQuery = $kapcsolat->prepare('SELECT id, szakember_id AS staffId, nev AS name, szoveg AS text, DATE_FORMAT(letrehozva, "%Y-%m-%d") AS date FROM velemenyek WHERE szakember_id = ? ORDER BY id DESC');
            $reviewsQuery->execute([$scope]);
            $reviews = $reviewsQuery->fetchAll();
            $orders = [];
        }
        respond(['scope' => $scope, 'bookings' => $bookings, 'reviews' => $reviews, 'orders' => $orders]);
    }

    if ($method !== 'POST') respond(['error' => 'Nem támogatott kérés.'], 405);
    requireCsrf();
    $data = body();

    if ($action === 'register') {
        $name = cleanString($data['name'] ?? '', 120);
        $email = mb_strtolower(cleanString($data['email'] ?? '', 190));
        $password = (string)($data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) respond(['error' => 'Adj meg érvényes e-mail címet és legalább 8 karakteres jelszót.'], 422);
        $query = $kapcsolat->prepare('INSERT INTO felhasznalok (nev, email, jelszo_hash) VALUES (?, ?, ?)');
        try { $query->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]); }
        catch (PDOException $e) {
            if ($e->getCode() === '23000') respond(['error' => 'Ezzel az e-mail címmel már létezik fiók.'], 409);
            throw $e;
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$kapcsolat->lastInsertId();
        $linkBookings = $kapcsolat->prepare('UPDATE foglalasok SET felhasznalo_id = ? WHERE email = ? AND felhasznalo_id IS NULL');
        $linkBookings->execute([$_SESSION['user_id'], $email]);
        respond(['ok' => true]);
    }

    if ($action === 'admin_user_create') {
        $adminId = requireAdmin();
        if (adminScope($adminId) !== 'all') {
            respond(['error' => 'Új adminfiókot csak teljes jogosultságú admin hozhat létre.'], 403);
        }
        $name = cleanString($data['name'] ?? '', 120);
        $email = mb_strtolower(cleanString($data['email'] ?? '', 190));
        $password = (string)($data['password'] ?? '');
        $scope = (string)($data['scope'] ?? '');
        if (!in_array($scope, ['all', 'toth_zoltan', 'lindner_szabolcs'], true)) {
            respond(['error' => 'Válassz érvényes admin jogosultsági kört.'], 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 10) {
            respond(['error' => 'Adj meg érvényes e-mail címet és legalább 10 karakteres jelszót.'], 422);
        }
        $query = $kapcsolat->prepare('INSERT INTO felhasznalok (nev, email, jelszo_hash, admin, admin_scope) VALUES (?, ?, ?, 1, ?)');
        try {
            $query->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $scope]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') respond(['error' => 'Ezzel az e-mail címmel már létezik fiók.'], 409);
            throw $e;
        }
        respond(['ok' => true]);
    }

    if ($action === 'login') {
        $email = mb_strtolower(cleanString($data['email'] ?? '', 190));
        $password = (string)($data['password'] ?? '');
        $query = $kapcsolat->prepare('SELECT id, jelszo_hash FROM felhasznalok WHERE email = ?');
        $query->execute([$email]);
        $user = $query->fetch();
        if (!$user || !password_verify($password, $user['jelszo_hash'])) respond(['error' => 'Az e-mail cím vagy a jelszó nem megfelelő.'], 401);
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        respond(['ok' => true]);
    }

    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        respond(['ok' => true]);
    }

    if ($action === 'booking_create') {
        $id = userId() ?: null;
        $staff = (string)($data['staffId'] ?? '');
        $service = (string)($data['serviceId'] ?? '');
        $catalog = [
            'toth_zoltan' => ['pol_1' => '1 Lépcsős Polírozás', 'pol_3' => '3 Lépcsős Prémium Polírozás'],
            'juhasz_gabor' => ['belso_alap' => 'Alap Kozmetika', 'belso_prem' => 'Prémium Bőr/Kárpittisztítás'],
            'lindner_szabolcs' => ['ker_1' => '1 Éves Védőbevonat', 'ker_3' => '3 Éves 9H Kerámia'],
        ];
        if (!isset($catalog[$staff][$service])) respond(['error' => 'Érvénytelen szakember vagy szolgáltatás.'], 422);
        $name = cleanString($data['name'] ?? '', 120);
        $email = mb_strtolower(cleanString($data['email'] ?? '', 190));
        $date = (string)($data['date'] ?? '');
        $time = (string)($data['time'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !in_array($time, ['08:00', '10:00', '13:00', '15:00'], true) || $date < date('Y-m-d')) respond(['error' => 'Ellenőrizd a foglalási adatokat.'], 422);
        $query = $kapcsolat->prepare('INSERT INTO foglalasok (felhasznalo_id, szakember_id, szolgaltatas_id, szolgaltatas_nev, ugyfel_nev, email, datum, idopont) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        try { $query->execute([$id, $staff, $service, $catalog[$staff][$service], $name, $email, $date, $time]); }
        catch (PDOException $e) {
            if ($e->getCode() === '23000') respond(['error' => 'Ez az időpont már foglalt. Válassz másikat.'], 409);
            throw $e;
        }
        respond(['ok' => true, 'id' => (int)$kapcsolat->lastInsertId()]);
    }

    if ($action === 'booking_cancel') {
        $id = requireLogin();
        $query = $kapcsolat->prepare('DELETE FROM foglalasok WHERE id = ? AND felhasznalo_id = ?');
        $query->execute([(int)($data['id'] ?? 0), $id]);
        if (!$query->rowCount()) respond(['error' => 'A foglalás nem található.'], 404);
        respond(['ok' => true]);
    }

    if ($action === 'car_save') {
        $id = requireLogin();
        $type = cleanString($data['type'] ?? '', 100);
        $plate = mb_strtoupper(cleanString($data['plate'] ?? '', 20));
        $query = $kapcsolat->prepare('INSERT INTO jarmuvek (felhasznalo_id, tipus, rendszam) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tipus = VALUES(tipus), rendszam = VALUES(rendszam)');
        $query->execute([$id, $type, $plate]);
        respond(['ok' => true]);
    }

    if ($action === 'review_create') {
        $staff = (string)($data['staffId'] ?? '');
        if (!in_array($staff, ['toth_zoltan', 'juhasz_gabor', 'lindner_szabolcs'], true)) respond(['error' => 'Ismeretlen szakember.'], 422);
        $name = cleanString($data['name'] ?? '', 120);
        $text = cleanString($data['text'] ?? '', 2000);
        $query = $kapcsolat->prepare('INSERT INTO velemenyek (szakember_id, nev, szoveg) VALUES (?, ?, ?)');
        $query->execute([$staff, $name, $text]);
        respond(['ok' => true, 'id' => (int)$kapcsolat->lastInsertId()]);
    }

    if ($action === 'order_create') {
        $amount = (int)($data['amount'] ?? 0);
        if (!in_array($amount, [25000, 50000, 120000], true)) respond(['error' => 'Érvénytelen utalványérték.'], 422);
        $recipient = cleanString($data['recipient'] ?? '', 120);
        $email = mb_strtolower(cleanString($data['email'] ?? '', 190));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(['error' => 'Adj meg érvényes e-mail címet.'], 422);
        $code = 'LUX-' . strtoupper(bin2hex(random_bytes(4)));
        $query = $kapcsolat->prepare('INSERT INTO utalvany_rendelesek (rendelesi_kod, ertek, megajandekozott, email) VALUES (?, ?, ?, ?)');
        $query->execute([$code, $amount, $recipient, $email]);
        respond(['ok' => true, 'code' => $code]);
    }

    if ($action === 'order_complete') {
        $code = (string)($data['code'] ?? '');
        $query = $kapcsolat->prepare("UPDATE utalvany_rendelesek SET allapot = 'teljesítve' WHERE rendelesi_kod = ? AND allapot = 'új'");
        $query->execute([$code]);
        if (!$query->rowCount()) respond(['error' => 'A rendelés nem található.'], 404);
        respond(['ok' => true]);
    }

    if ($action === 'admin_booking_cancel') {
        $scope = adminScope(requireAdmin());
        if ($scope === 'all') {
            $query = $kapcsolat->prepare('DELETE FROM foglalasok WHERE id = ?');
            $query->execute([(int)($data['id'] ?? 0)]);
        } else {
            $query = $kapcsolat->prepare('DELETE FROM foglalasok WHERE id = ? AND szakember_id = ?');
            $query->execute([(int)($data['id'] ?? 0), $scope]);
        }
        if (!$query->rowCount()) respond(['error' => 'A foglalás nem található vagy nincs hozzá jogosultság.'], 404);
        respond(['ok' => true]);
    }

    if ($action === 'admin_review_delete') {
        $scope = adminScope(requireAdmin());
        if ($scope === 'all') {
            $query = $kapcsolat->prepare('DELETE FROM velemenyek WHERE id = ?');
            $query->execute([(int)($data['id'] ?? 0)]);
        } else {
            $query = $kapcsolat->prepare('DELETE FROM velemenyek WHERE id = ? AND szakember_id = ?');
            $query->execute([(int)($data['id'] ?? 0), $scope]);
        }
        if (!$query->rowCount()) respond(['error' => 'A vélemény nem található vagy nincs hozzá jogosultság.'], 404);
        respond(['ok' => true]);
    }

    if ($action === 'admin_order_status') {
        $adminId = requireAdmin();
        if (adminScope($adminId) !== 'all') {
            respond(['error' => 'Az utalványrendelések kezeléséhez teljes admin jogosultság szükséges.'], 403);
        }
        $status = (string)($data['status'] ?? '');
        if (!in_array($status, ['új', 'teljesítve', 'törölve'], true)) respond(['error' => 'Érvénytelen rendelési állapot.'], 422);
        $query = $kapcsolat->prepare('UPDATE utalvany_rendelesek SET allapot = ? WHERE id = ?');
        $query->execute([$status, (int)($data['id'] ?? 0)]);
        respond(['ok' => true]);
    }

    respond(['error' => 'Ismeretlen művelet.'], 404);
} catch (Throwable $e) {
    error_log('API hiba [' . $action . ']: ' . $e->getMessage());
    respond(['error' => 'A művelet nem sikerült. Ellenőrizd a szerver és az adatbázis beállításait.'], 500);
}
