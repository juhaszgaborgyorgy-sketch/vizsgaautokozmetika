<?php
$szerver = "localhost";
$felhasznalo = "root"; // XAMPP alapértelmezett felhasználó
$jelszo = ""; // XAMPP alapértelmezett jelszó (üres)
$adatbazis = "luxus_studios";

try {
    $kapcsolat = new PDO("mysql:host=$szerver;dbname=$adatbazis;charset=utf8mb4", $felhasznalo, $jelszo);
    $kapcsolat->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Sikertelen csatlakozás: " . $e->getMessage());
}
?>