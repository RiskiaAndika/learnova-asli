<?php
$databaseUrl = getenv('DATABASE_URL')
    ?: 'mysql://root:gUIIUJpfBkDFrGuuADkzpzrovlFJBEYo@monorail.proxy.rlwy.net:46177/railway';

$db = parse_url($databaseUrl);

$host     = $db['host'];
$port     = $db['port'] ?? 3306;
$dbname   = ltrim($db['path'], '/');
$username = $db['user'];
$password = $db['pass'];

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    exit('Koneksi database gagal: ' . $e->getMessage());
}