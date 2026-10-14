<?php
$szerver = getenv('DB_HOST') ?: 'localhost';
$felhasznalo = getenv('DB_USER');
$jelszo = getenv('DB_PASS');
$adatbazis = getenv('DB_NAME') ?: 'luxus_studios';

if (!$felhasznalo || $jelszo === false) {
    error_log('Az adatbázis-kapcsolathoz hiányoznak a DB_USER és DB_PASS környezeti változók.');
    http_response_code(500);
    exit('A szolgáltatás jelenleg nem érhető el.');
}

try {
    $kapcsolat = new PDO("mysql:host=$szerver;dbname=$adatbazis;charset=utf8mb4", $felhasznalo, $jelszo, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch(PDOException $e) {
    error_log('Adatbázis-kapcsolati hiba: ' . $e->getMessage());
    http_response_code(500);
    exit('A szolgáltatás jelenleg nem érhető el.');
}
?>
