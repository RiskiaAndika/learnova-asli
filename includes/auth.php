<?php
if(session_status()===PHP_SESSION_NONE) session_start();
function require_login(){if(empty($_SESSION['user'])){header('Location: ../auth/login.php');exit;}}
function require_role($role){require_login();if(($_SESSION['user']['role']??'')!==$role){header('Location: ../index.php');exit;}}
function e($v){return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
