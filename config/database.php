<?php
$host = 'monorail.proxy.rlwy.net';
$port = '46177';
$dbname = 'railway';
$username = 'root';
$password = '...';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    exit('Koneksi database gagal. Pastikan MySQL aktif dan database learnova sudah diimpor.');
}

