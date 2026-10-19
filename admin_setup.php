<?php
declare(strict_types=1);
require_once __DIR__ . '/kapcsolat.php';

$isLocal = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
$count = (int)$kapcsolat->query('SELECT COUNT(*) FROM felhasznalok WHERE admin = 1')->fetchColumn();
$message = '';
$success = false;

if (!$isLocal) {
    http_response_code(403);
    $message = 'Az adminfiók beállítása csak ezen a számítógépen érhető el.';
} elseif ($count > 0) {
    $message = 'Már létezik adminfiók. A biztonság érdekében ez a beállítóoldal lezárult.';
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim((string)($_POST['nev'] ?? ''));
    $email = mb_strtolower(trim((string)($_POST['email'] ?? '')));
    $password = (string)($_POST['jelszo'] ?? '');
    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 10) {
        $message = 'Adj meg nevet, érvényes e-mail címet és legalább 10 karakteres jelszót.';
    } else {
        try {
            $insert = $kapcsolat->prepare("INSERT INTO felhasznalok (nev, email, jelszo_hash, admin, admin_scope) VALUES (?, ?, ?, 1, 'all')");
            $insert->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $success = true;
            $message = 'Az adminfiók létrejött. Mostantól jelentkezz be a weboldal Fiók oldalán.';
        } catch (PDOException $e) {
            $message = $e->getCode() === '23000' ? 'Ez az e-mail cím már használatban van.' : 'Nem sikerült létrehozni az adminfiókot.';
            if ($e->getCode() !== '23000') error_log('Admin létrehozási hiba: ' . $e->getMessage());
        }
    }
}
?>
<!doctype html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Adminfiók beállítása | Luxus Studios</title>
    <link rel="stylesheet" href="styles.css">
    <style>body{display:grid;place-items:center;padding:24px}.setup{width:min(100%,520px);padding:36px;background:#171717;border:1px solid #3a3320;border-radius:12px}.setup h1{color:#d4af37;margin-bottom:12px}.setup p{margin:16px 0}.setup .urlap-mezoszam{margin:8px 0 18px}</style>
</head>
<body>
<main class="setup">
    <h1>Adminfiók beállítása</h1>
    <?php if ($message !== ''): ?><p role="status"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <?php if ($isLocal && $count === 0 && !$success): ?>
        <form method="post">
            <label for="nev">Név</label><input class="urlap-mezoszam" id="nev" name="nev" required maxlength="120">
            <label for="email">E-mail cím</label><input class="urlap-mezoszam" id="email" name="email" type="email" required maxlength="190">
            <label for="jelszo">Jelszó (legalább 10 karakter)</label><input class="urlap-mezoszam" id="jelszo" name="jelszo" type="password" required minlength="10" autocomplete="new-password">
            <button class="gomb gomb-elsodleges" type="submit">Adminfiók létrehozása</button>
        </form>
    <?php endif; ?>
    <p><a href="ugyfelkapu.html" class="nav-link">Vissza a bejelentkezéshez</a></p>
</main>
</body>
</html>
