<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

$databaseUrl = getenv('DATABASE_URL')
    ?: 'mysql://root:gUIIUJpfBkDFrGuuADkzpzrovlFJBEYo@monorail.proxy.rlwy.net:46177/railway';

$dbParts  = parse_url($databaseUrl);
$host     = $dbParts['host'];
$port     = $dbParts['port'] ?? 3306;
$dbname   = ltrim($dbParts['path'], '/');
$user     = $dbParts['user'];
$pass     = $dbParts['pass'];

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $e->getMessage(),
    ]);
    exit;
}

function input() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
?>