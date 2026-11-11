<?php
require 'config.php';

$d = input();
$name = trim($d['name'] ?? '');
$email = trim($d['email'] ?? '');
$password = $d['password'] ?? '';
$role = $d['role'] ?? 'peserta';

if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6 || !in_array($role, ['peserta', 'penyelenggara'], true)) {
    echo json_encode(['success' => false, 'message' => 'Periksa kembali data pendaftaran.']);
    exit;
}

try {
    $q = $pdo->prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)');
    $q->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $role]);
    echo json_encode(['success' => true, 'message' => 'Pendaftaran berhasil. Silakan masuk.', 'redirect' => 'login.html']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar atau terjadi kesalahan.']);
}
?>