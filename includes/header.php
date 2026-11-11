<?php
if (session_status() === PHP_SESSION_NONE) session_start();
$pageTitle = $pageTitle ?? 'Learnova';
$user = $_SESSION['user'] ?? null;
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title><?= htmlspecialchars($pageTitle) ?> | Learnova</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <script src="../assets/js/script.js" defer></script>
  </head>
  <body>
    <header class="top">
      <a class="brand" href="../index.php"><b>L</b> Learnova</a>
      <nav>
        <?php if ($user): ?>
          <span><?= htmlspecialchars($user['name']) ?></span>
          <a href="../auth/logout.php">Keluar</a>
        <?php else: ?>
          <a href="../auth/login.php">Masuk</a>
          <a class="btn small" href="../auth/register.php">Daftar</a>
        <?php endif; ?>
      </nav>
    </header>
    <main class="wrap">
