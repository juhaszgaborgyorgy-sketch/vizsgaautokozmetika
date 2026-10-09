<?php
// 1. Kapcsolat betöltése
require_once 'kapcsolat.php';

// 2. Ellenőrizzük, hogy tényleg formból jöttek-e az adatok
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 3. Adatok kinyerése a name attribútumok alapján
    $szakember = $_POST['szakember_id'];
    $nev = $_POST['nev'];
    $szoveg = $_POST['szoveg'];

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
        header("Location: " . $szakember . ".html");
        exit();

    } catch(PDOException $e) {
        echo "Hiba történt a mentés során: " . $e->getMessage();
    }
} else {
    echo "Nincs adat beküldve!";
}
?>