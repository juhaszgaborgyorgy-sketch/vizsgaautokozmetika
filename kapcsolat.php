<?php
declare(strict_types=1);

$host = getenv('DB_HOST') ?: '127.0.0.1';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS');
$password = $password === false ? '' : $password;
$database = getenv('DB_NAME') ?: 'luxus_studios';

try {
    $kapcsolat = new PDO(
        "mysql:host={$host};dbname={$database};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    error_log('Adatbázis-kapcsolati hiba: ' . $e->getMessage());
    http_response_code(500);
    exit('Nem sikerült kapcsolódni az adatbázishoz. Ellenőrizd a MySQL szolgáltatást és a kapcsolat beállításait.');
}
