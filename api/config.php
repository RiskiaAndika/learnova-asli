<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

$host = 'localhost';
$db = 'learnova';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal. Periksa database.sql dan konfigurasi MySQL.',
    ]);
    exit;
}

function input() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
?>