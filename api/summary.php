<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false]);
    exit;
}

$id = (int) $_SESSION['user_id'];
$out = ['success' => true];

if ($_SESSION['role'] === 'peserta') {
    $q = $pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM points WHERE user_id=?');
    $q->execute([$id]);
    $out['points'] = (int) $q->fetchColumn();

    $q = $pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM points WHERE user_id=? AND YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())');
    $q->execute([$id]);
    $out['month_points'] = (int) $q->fetchColumn();

    $out['tier'] = '—'; // tier bulanan belum dihitung
} elseif ($_SESSION['role'] === 'penyelenggara') {
    $q = $pdo->prepare("SELECT COUNT(*), COALESCE(SUM(status='published'),0), COALESCE(SUM(status='draft'),0) FROM classes WHERE organizer_id=?");
    $q->execute([$id]);
    [$out['classes'], $out['published'], $out['draft']] = array_map('intval', $q->fetch(PDO::FETCH_NUM));
}

echo json_encode($out);
