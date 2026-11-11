<?php
require 'config.php';

$d = input();
$email = trim($d['email'] ?? '');
$role = $d['role'] ?? ''; // 'peserta' (murid) atau 'penyelenggara' (pengajar)

$q = $pdo->prepare('SELECT id,name,email,password,role FROM users WHERE email=?');
$q->execute([$email]);
$u = $q->fetch(PDO::FETCH_ASSOC);

if (!$u || !password_verify($d['password'] ?? '', $u['password'])) {
    echo json_encode(['success' => false, 'message' => 'Email atau password salah.']);
    exit;
}

// Akun harus cocok dengan tab login yang dipilih (admin boleh lewat tab mana pun).
$names = ['peserta' => 'murid', 'penyelenggara' => 'pengajar'];
if ($u['role'] !== 'admin' && in_array($role, ['peserta', 'penyelenggara'], true) && $u['role'] !== $role) {
    echo json_encode([
        'success' => false,
        'message' => 'Akun ini terdaftar sebagai ' . $names[$u['role']] . '. Pilih tab "' . ucfirst($names[$u['role']]) . '" untuk masuk.',
    ]);
    exit;
}

session_regenerate_id(true);
$_SESSION['user_id'] = $u['id'];
$_SESSION['role'] = $u['role'];
$_SESSION['name'] = $u['name'];

$dest = ['admin' => 'admin', 'penyelenggara' => 'penyelenggara', 'peserta' => 'peserta'][$u['role']];
echo json_encode([
    'success' => true,
    'message' => 'Login berhasil.',
    'redirect' => "pages/$dest/dashboard.html",
]);
