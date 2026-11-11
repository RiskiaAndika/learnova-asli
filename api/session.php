<?php
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['authenticated' => false]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'id' => $_SESSION['user_id'],
    'name' => $_SESSION['name'],
    'role' => $_SESSION['role'],
]);
?>