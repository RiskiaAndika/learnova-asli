<?php
require __DIR__ . '/config.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Silakan login terlebih dahulu.']);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$role = $_SESSION['role'];
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET') {
        if ($role === 'penyelenggara') {
            $stmt = $pdo->prepare('SELECT id, title, description, schedule, status FROM classes WHERE organizer_id = ? ORDER BY id DESC');
            $stmt->execute([$userId]);
        } elseif ($role === 'peserta') {
            $stmt = $pdo->query("SELECT c.id, c.title, c.description, c.schedule, c.status, u.name AS organizer_name FROM classes c JOIN users u ON u.id = c.organizer_id WHERE c.status = 'published' ORDER BY c.id DESC");
        } else {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Role tidak memiliki akses.']);
            exit;
        }
        echo json_encode(['success' => true, 'classes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if ($method === 'POST') {
        if ($role !== 'penyelenggara') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Hanya pengajar yang dapat mengelola kelas.']);
            exit;
        }
        $data = input();

        // Publikasikan kelas yang sudah dibuat.
        if (($data['action'] ?? '') === 'publish') {
            $classId = (int) ($data['id'] ?? 0);
            $stmt = $pdo->prepare("UPDATE classes SET status = 'published' WHERE id = ? AND organizer_id = ?");
            $stmt->execute([$classId, $userId]);
            if (!$stmt->rowCount()) {
                $check = $pdo->prepare('SELECT id, status FROM classes WHERE id = ? AND organizer_id = ?');
                $check->execute([$classId, $userId]);
                $existing = $check->fetch(PDO::FETCH_ASSOC);
                if (!$existing || $existing['status'] !== 'published') {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Kelas tidak ditemukan atau bukan milik akun ini.']);
                    exit;
                }
            }
            echo json_encode(['success' => true, 'message' => 'Kelas berhasil dipublikasikan. Sekarang kelas dapat dilihat murid di Academy.']);
            exit;
        }

        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $schedule = trim($data['schedule'] ?? '');
        if ($title === '') {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Nama kelas wajib diisi.']);
            exit;
        }
        if (mb_strlen($title) > 150) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Nama kelas maksimal 150 karakter.']);
            exit;
        }
        $scheduleValue = null;
        if ($schedule !== '') {
            $date = DateTime::createFromFormat('Y-m-d\\TH:i', $schedule);
            if (!$date) {
                http_response_code(422);
                echo json_encode(['success' => false, 'message' => 'Format jadwal tidak valid.']);
                exit;
            }
            $scheduleValue = $date->format('Y-m-d H:i:s');
        }
        $stmt = $pdo->prepare("INSERT INTO classes (organizer_id, title, description, schedule, status) VALUES (?, ?, ?, ?, 'draft')");
        $stmt->execute([$userId, $title, $description, $scheduleValue]);
        echo json_encode(['success' => true, 'message' => 'Kelas berhasil disimpan sebagai draft. Tekan Publikasikan agar kelas muncul di Academy murid.', 'id' => (int) $pdo->lastInsertId()]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode tidak didukung.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan database saat mengelola kelas.']);
}
