<?php
// 1. Kapcsolat betöltése
require_once 'kapcsolat.php';

// 2. Ellenőrizzük, hogy tényleg formból jöttek-e az adatok
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // 3. Adatok kinyerése a name attribútumok alapján
    $engedelyezettSzakemberek = ['toth_zoltan', 'juhasz_gabor', 'lindner_szabolcs'];
    $szakember = filter_input(INPUT_POST, 'szakember_id', FILTER_UNSAFE_RAW);
    $nev = trim((string)($_POST['nev'] ?? ''));
    $szoveg = trim((string)($_POST['szoveg'] ?? ''));

    if (!in_array($szakember, $engedelyezettSzakemberek, true) || $nev === '' || strlen($nev) > 400 || $szoveg === '' || strlen($szoveg) > 20000) {
        http_response_code(400);
        exit('Kérjük, ellenőrizze a beküldött adatokat.');
    }

    try {
        // 4. SQL lekérdezés előkészítése (biztonságos módszer)
        $sql = "INSERT INTO velemenyek (szakember_id, nev, szoveg) VALUES (:szakember, :nev, :szoveg)";
        $utasitas = $kapcsolat->prepare($sql);

        // 5. Adatok bekötése és futtatás
        $utasitas->bindParam(':szakember', $szakember);
        $utasitas->bindParam(':nev', $nev);
        $utasitas->bindParam(':szoveg', $szoveg);

        $utasitas->execute();

        // 6. Sikeres mentés után visszairányítás a profilra
        // A szakember_id alapján tudjuk, melyik oldalra kell visszavinni
        header("Location: {$szakember}.html", true, 303);
        exit();

    } catch(PDOException $e) {
        error_log('Vélemény mentési hiba: ' . $e->getMessage());
        http_response_code(500);
        echo 'A véleményt most nem sikerült menteni. Kérjük, próbálja meg később.';
    }
} else {
    echo "Nincs adat beküldve!";
}
?>
