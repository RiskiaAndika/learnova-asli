<?php
require __DIR__ . '/config.php';

if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Silakan login terlebih dahulu.']);
    exit;
}

$uid = (int) $_SESSION['user_id'];
$role = $_SESSION['role'];
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

function out($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function needRole($role, $expected)
{
    if ($role !== $expected) {
        out(['success' => false, 'message' => 'Akses tidak diizinkan.'], 403);
    }
}

function addPoints($pdo, $user, $amount, $note, $source, $ref)
{
    $q = $pdo->prepare('INSERT IGNORE INTO points(user_id,amount,note,source,reference_id) VALUES(?,?,?,?,?)');
    $q->execute([$user, $amount, $note, $source, $ref]);
    return $q->rowCount() > 0;
}

function dateInput($v)
{
    if (!$v) {
        return null;
    }

    $d = DateTime::createFromFormat('Y-m-d\TH:i', $v);
    if (!$d) {
        throw new Exception('Format tanggal dan waktu tidak valid.');
    }

    return $d->format('Y-m-d H:i:s');
}

function awardPreviousMonth($pdo)
{
    $first = new DateTime('first day of this month');
    $first->setTime(0, 0, 0);
    $prev = (clone $first)->modify('-1 month');
    $key = $prev->format('Y-m');
    $ref = (int) $prev->format('Ym');

    $check = $pdo->prepare('SELECT COUNT(*) FROM monthly_awards WHERE month_key=?');
    $check->execute([$key]);
    if ((int) $check->fetchColumn() > 0) {
        return;
    }

    $q = $pdo->prepare("SELECT p.user_id, SUM(p.amount) AS total FROM points p WHERE p.amount>0 AND (p.source IS NULL OR p.source <> 'leaderboard_bonus') AND DATE_FORMAT(p.created_at,'%Y-%m')=? GROUP BY p.user_id ORDER BY total DESC, p.user_id ASC LIMIT 50");
    $q->execute([$key]);
    $rows = $q->fetchAll(PDO::FETCH_ASSOC);

    $pdo->beginTransaction();
    try {
        foreach ($rows as $i => $r) {
            $rank = $i + 1;
            $bonus = $rank === 1 ? 200 : ($rank === 2 ? 150 : ($rank === 3 ? 100 : 50));

            $ins = $pdo->prepare('INSERT IGNORE INTO monthly_awards(user_id,month_key,rank_position,points_awarded) VALUES(?,?,?,?)');
            $ins->execute([(int) $r['user_id'], $key, $rank, $bonus]);

            if ($ins->rowCount()) {
                addPoints($pdo, (int) $r['user_id'], $bonus, "Bonus leaderboard {$key} peringkat #{$rank}", 'leaderboard_bonus', $ref);
            }
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function getClassOwned($pdo, $classId, $uid)
{
    $q = $pdo->prepare('SELECT * FROM classes WHERE id=? AND organizer_id=?');
    $q->execute([$classId, $uid]);
    return $q->fetch(PDO::FETCH_ASSOC);
}

try {
    if ($method === 'GET') {
        if ($action === 'classes') {
            if ($role === 'penyelenggara') {
                $q = $pdo->prepare("SELECT c.*, (SELECT COUNT(*) FROM enrollments e WHERE e.class_id=c.id AND e.payment_status IN ('free','paid')) AS student_count FROM classes c WHERE c.organizer_id=? ORDER BY c.id DESC");
                $q->execute([$uid]);
            } else {
                needRole($role, 'peserta');
                $q = $pdo->prepare("SELECT c.*,u.name AS organizer_name, e.id AS enrollment_id,e.payment_status FROM classes c JOIN users u ON u.id=c.organizer_id LEFT JOIN enrollments e ON e.class_id=c.id AND e.user_id=? WHERE c.status='published' ORDER BY c.id DESC");
                $q->execute([$uid]);
            }

            out(['success' => true, 'classes' => $q->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'schedules') {
            if ($role === 'penyelenggara') {
                $q = $pdo->prepare('SELECT id,title,description,schedule FROM classes WHERE organizer_id=? AND schedule IS NOT NULL ORDER BY schedule');
                $q->execute([$uid]);
            } else {
                needRole($role, 'peserta');
                $q = $pdo->prepare("SELECT c.id,c.title,c.description,c.schedule,u.name AS organizer_name FROM enrollments e JOIN classes c ON c.id=e.class_id JOIN users u ON u.id=c.organizer_id WHERE e.user_id=? AND e.payment_status IN ('free','paid') AND c.schedule IS NOT NULL ORDER BY c.schedule");
                $q->execute([$uid]);
            }

            out(['success' => true, 'schedules' => $q->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'quizzes') {
            if ($role === 'penyelenggara') {
                $q = $pdo->prepare('SELECT q.*,c.title AS class_title,(SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id=q.id) question_count FROM quizzes q JOIN classes c ON c.id=q.class_id WHERE q.organizer_id=? ORDER BY q.id DESC');
                $q->execute([$uid]);
            } else {
                needRole($role, 'peserta');
                $q = $pdo->prepare("SELECT q.id,q.title,q.description,q.class_id,c.title AS class_title,(SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id=q.id) question_count, a.score,a.correct_count,a.total_questions,a.points_awarded,a.submitted_at FROM quizzes q JOIN classes c ON c.id=q.class_id JOIN enrollments e ON e.class_id=c.id AND e.user_id=? AND e.payment_status IN ('free','paid') LEFT JOIN quiz_attempts a ON a.quiz_id=q.id AND a.user_id=? WHERE q.is_published=1 ORDER BY q.id DESC");
                $q->execute([$uid, $uid]);
            }

            out(['success' => true, 'quizzes' => $q->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'quiz_detail') {
            needRole($role, 'peserta');
            $qid = (int) ($_GET['id'] ?? 0);

            $q = $pdo->prepare("SELECT q.id,q.title,q.description,q.class_id,c.title AS class_title FROM quizzes q JOIN classes c ON c.id=q.class_id JOIN enrollments e ON e.class_id=c.id AND e.user_id=? AND e.payment_status IN ('free','paid') WHERE q.id=? AND q.is_published=1");
            $q->execute([$uid, $qid]);
            $quiz = $q->fetch(PDO::FETCH_ASSOC);

            if (!$quiz) {
                out(['success' => false, 'message' => 'Kuis tidak ditemukan atau kamu belum bergabung di kelas.'], 404);
            }

            $a = $pdo->prepare('SELECT id,score,correct_count,total_questions,points_awarded,submitted_at FROM quiz_attempts WHERE quiz_id=? AND user_id=?');
            $a->execute([$qid, $uid]);
            $attempt = $a->fetch(PDO::FETCH_ASSOC);

            if ($attempt) {
                out(['success' => true, 'quiz' => $quiz, 'attempt' => $attempt, 'questions' => []]);
            }

            $q = $pdo->prepare('SELECT id,question,option_a,option_b,option_c,option_d FROM quiz_questions WHERE quiz_id=? ORDER BY sort_order,id');
            $q->execute([$qid]);

            out(['success' => true, 'quiz' => $quiz, 'attempt' => null, 'questions' => $q->fetchAll(PDO::FETCH_ASSOC)]);
        }

        if ($action === 'leaderboard') {
            needRole($role, 'peserta');
            awardPreviousMonth($pdo);

            $month = (new DateTime('now'))->format('Y-m');
            $q = $pdo->prepare("SELECT u.id,u.name,SUM(p.amount) AS points FROM points p JOIN users u ON u.id=p.user_id WHERE p.amount>0 AND (p.source IS NULL OR p.source <> 'leaderboard_bonus') AND DATE_FORMAT(p.created_at,'%Y-%m')=? AND u.role='peserta' GROUP BY u.id,u.name ORDER BY points DESC,u.name ASC LIMIT 50");
            $q->execute([$month]);
            $rows = $q->fetchAll(PDO::FETCH_ASSOC);

            $me = $pdo->prepare("SELECT COALESCE(SUM(amount),0) FROM points WHERE user_id=? AND amount>0 AND source <> 'leaderboard_bonus' AND DATE_FORMAT(created_at,'%Y-%m')=?");
            $me->execute([$uid, $month]);
            $my = (int) $me->fetchColumn();

            $rank = null;
            foreach ($rows as $i => $r) {
                $rows[$i]['rank'] = $i + 1;
                if ((int) $r['id'] === $uid) {
                    $rank = $i + 1;
                }
            }

            out(['success' => true, 'month' => $month, 'leaderboard' => $rows, 'my_points' => $my, 'my_rank' => $rank]);
        }

        if ($action === 'rewards') {
            needRole($role, 'peserta');
            $q = $pdo->prepare('SELECT id,name,description,points_required,stock FROM rewards WHERE active=1 AND stock>0 ORDER BY points_required');
            $q->execute();

            $bal = $pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM points WHERE user_id=?');
            $bal->execute([$uid]);

            $hist = $pdo->prepare('SELECT r.name,d.voucher_code,d.status,d.created_at FROM redemptions d JOIN rewards r ON r.id=d.reward_id WHERE d.user_id=? ORDER BY d.id DESC LIMIT 15');
            $hist->execute([$uid]);

            out(['success' => true, 'balance' => (int) $bal->fetchColumn(), 'rewards' => $q->fetchAll(PDO::FETCH_ASSOC), 'history' => $hist->fetchAll(PDO::FETCH_ASSOC)]);
        }

        out(['success' => false, 'message' => 'Aksi GET tidak dikenal.'], 404);
    }

    if ($method === 'POST') {
        $d = input();

        if ($action === 'create_class' || $action === 'update_class') {
            needRole($role, 'penyelenggara');

            $title = trim($d['title'] ?? '');
            $desc = trim($d['description'] ?? '');
            $access = ($d['access_type'] ?? 'free') === 'paid' ? 'paid' : 'free';
            $price = $access === 'paid' ? max(0, (float) ($d['price'] ?? 0)) : 0;
            $schedule = dateInput($d['schedule'] ?? '');

            if ($title === '') {
                out(['success' => false, 'message' => 'Nama kelas wajib diisi.'], 422);
            }
            if ($access === 'paid' && $price <= 0) {
                out(['success' => false, 'message' => 'Harga kelas berbayar harus lebih dari Rp0.'], 422);
            }

            if ($action === 'create_class') {
                $q = $pdo->prepare("INSERT INTO classes(organizer_id,title,description,schedule,status,access_type,price) VALUES(?,?,?,?,'draft',?,?)");
                $q->execute([$uid, $title, $desc, $schedule, $access, $price]);
            } else {
                $id = (int) ($d['id'] ?? 0);
                if (!getClassOwned($pdo, $id, $uid)) {
                    out(['success' => false, 'message' => 'Kelas tidak ditemukan.'], 404);
                }
                $q = $pdo->prepare("UPDATE classes SET title=?,description=?,schedule=?,access_type=?,price=? WHERE id=? AND organizer_id=?");
                $q->execute([$title, $desc, $schedule, $access, $price, $id, $uid]);
            }

            out(['success' => true, 'message' => 'Data kelas berhasil disimpan.']);
        }

        if ($action === 'publish_class' || $action === 'delete_class') {
            needRole($role, 'penyelenggara');
            $id = (int) ($d['id'] ?? 0);

            if (!getClassOwned($pdo, $id, $uid)) {
                out(['success' => false, 'message' => 'Kelas tidak ditemukan.'], 404);
            }

            if ($action === 'publish_class') {
                $q = $pdo->prepare("UPDATE classes SET status='published' WHERE id=? AND organizer_id=?");
                $q->execute([$id, $uid]);
                out(['success' => true, 'message' => 'Kelas berhasil dipublikasikan.']);
            }

            $q = $pdo->prepare('DELETE FROM classes WHERE id=? AND organizer_id=?');
            $q->execute([$id, $uid]);
            out(['success' => true, 'message' => 'Kelas berhasil dihapus.']);
        }

        if ($action === 'join_class') {
            needRole($role, 'peserta');
            $id = (int) ($d['class_id'] ?? 0);

            $q = $pdo->prepare("SELECT id,access_type,price FROM classes WHERE id=? AND status='published'");
            $q->execute([$id]);
            $c = $q->fetch(PDO::FETCH_ASSOC);

            if (!$c) {
                out(['success' => false, 'message' => 'Kelas tidak tersedia.'], 404);
            }

            $q = $pdo->prepare('SELECT id,payment_status FROM enrollments WHERE class_id=? AND user_id=?');
            $q->execute([$id, $uid]);
            $old = $q->fetch(PDO::FETCH_ASSOC);

            if ($old && in_array($old['payment_status'], ['free', 'paid'], true)) {
                out(['success' => false, 'message' => 'Kamu sudah bergabung di kelas ini.'], 409);
            }

            if ($c['access_type'] === 'free') {
                $q = $pdo->prepare("INSERT INTO enrollments(class_id,user_id,payment_status) VALUES(?,?,'free') ON DUPLICATE KEY UPDATE payment_status='free'");
                $q->execute([$id, $uid]);
                addPoints($pdo, $uid, 20, 'Reward bergabung kelas', 'class_join', $id);
                out(['success' => true, 'status' => 'joined', 'message' => 'Berhasil bergabung! Kamu mendapat 20 poin reward.']);
            }

            $ref = 'LNV' . date('ymdHis') . str_pad((string) $uid, 4, '0', STR_PAD_LEFT) . $id;
            $q = $pdo->prepare("INSERT INTO enrollments(class_id,user_id,payment_status,payment_reference) VALUES(?,?,'pending',?) ON DUPLICATE KEY UPDATE payment_status='pending',payment_reference=VALUES(payment_reference)");
            $q->execute([$id, $uid, $ref]);
            out(['success' => true, 'status' => 'pending', 'payment_reference' => $ref, 'price' => (float) $c['price'], 'message' => 'Pesanan dibuat. Selesaikan pembayaran untuk membuka kelas.']);
        }

        if ($action === 'demo_pay') {
            needRole($role, 'peserta');
            $id = (int) ($d['class_id'] ?? 0);

            $pdo->beginTransaction();
            $q = $pdo->prepare("SELECT e.id,e.payment_status,c.access_type FROM enrollments e JOIN classes c ON c.id=e.class_id WHERE e.class_id=? AND e.user_id=? FOR UPDATE");
            $q->execute([$id, $uid]);
            $e = $q->fetch(PDO::FETCH_ASSOC);

            if (!$e || $e['payment_status'] !== 'pending' || $e['access_type'] !== 'paid') {
                $pdo->rollBack();
                out(['success' => false, 'message' => 'Pesanan pembayaran tidak ditemukan.'], 404);
            }

            $q = $pdo->prepare("UPDATE enrollments SET payment_status='paid' WHERE id=?");
            $q->execute([$e['id']]);
            addPoints($pdo, $uid, 20, 'Reward bergabung kelas berbayar', 'class_join', $id);
            $pdo->commit();

            out(['success' => true, 'message' => 'Pembayaran demo berhasil. Kelas sekarang terbuka.']);
        }

        if ($action === 'create_quiz') {
            needRole($role, 'penyelenggara');
            $classId = (int) ($d['class_id'] ?? 0);
            $title = trim($d['title'] ?? '');
            $desc = trim($d['description'] ?? '');
            $questions = $d['questions'] ?? [];

            if (!getClassOwned($pdo, $classId, $uid)) {
                out(['success' => false, 'message' => 'Pilih kelas milikmu.'], 422);
            }
            if ($title === '' || !is_array($questions) || count($questions) < 1) {
                out(['success' => false, 'message' => 'Judul dan minimal satu soal wajib diisi.'], 422);
            }

            $pdo->beginTransaction();
            $q = $pdo->prepare('INSERT INTO quizzes(class_id,organizer_id,title,description,is_published) VALUES(?,?,?,?,0)');
            $q->execute([$classId, $uid, $title, $desc]);
            $qid = (int) $pdo->lastInsertId();

            $ins = $pdo->prepare('INSERT INTO quiz_questions(quiz_id,question,option_a,option_b,option_c,option_d,correct_option,sort_order) VALUES(?,?,?,?,?,?,?,?)');
            foreach ($questions as $i => $v) {
                $question = trim($v['question'] ?? '');
                $opts = [$v['A'] ?? '', $v['B'] ?? '', $v['C'] ?? '', $v['D'] ?? ''];
                $correct = strtoupper($v['correct'] ?? '');

                if ($question === '' || in_array('', array_map('trim', $opts), true) || !in_array($correct, ['A', 'B', 'C', 'D'], true)) {
                    throw new Exception('Lengkapi pertanyaan, semua pilihan, dan jawaban benar.');
                }

                $ins->execute([$qid, $question, $opts[0], $opts[1], $opts[2], $opts[3], $correct, $i + 1]);
            }

            $pdo->commit();
            out(['success' => true, 'message' => 'Kuis berhasil dibuat sebagai draft.', 'id' => $qid]);
        }

        if ($action === 'publish_quiz') {
            needRole($role, 'penyelenggara');
            $id = (int) ($d['id'] ?? 0);

            $q = $pdo->prepare("UPDATE quizzes SET is_published=1 WHERE id=? AND organizer_id=?");
            $q->execute([$id, $uid]);
            out(['success' => true, 'message' => 'Kuis dipublikasikan.']);
        }

        if ($action === 'check_quiz_answer') {
            needRole($role, 'peserta');
            $qid = (int) ($d['quiz_id'] ?? 0);
            $questionId = (int) ($d['question_id'] ?? 0);

            $q = $pdo->prepare("SELECT qq.correct_option FROM quiz_questions qq JOIN quizzes q ON q.id=qq.quiz_id JOIN enrollments e ON e.class_id=q.class_id AND e.user_id=? AND e.payment_status IN ('free','paid') WHERE qq.id=? AND qq.quiz_id=? AND q.is_published=1");
            $q->execute([$uid, $questionId, $qid]);
            $row = $q->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                out(['success' => false, 'message' => 'Soal tidak ditemukan atau akses kuis tidak tersedia.'], 404);
            }

            $correctOption = strtoupper(trim((string) $row['correct_option']));
            $answer = strtoupper(trim((string) ($d['answer'] ?? '')));
            out(['success' => true, 'correct_option' => $correctOption, 'is_correct' => $answer !== '' && $answer === $correctOption]);
        }

        if ($action === 'submit_quiz') {
            needRole($role, 'peserta');
            $qid = (int) ($d['quiz_id'] ?? 0);
            $answers = $d['answers'] ?? [];

            $q = $pdo->prepare("SELECT q.id FROM quizzes q JOIN enrollments e ON e.class_id=q.class_id AND e.user_id=? AND e.payment_status IN ('free','paid') WHERE q.id=? AND q.is_published=1");
            $q->execute([$uid, $qid]);
            if (!$q->fetch()) {
                out(['success' => false, 'message' => 'Kuis tidak tersedia untuk akunmu.'], 403);
            }

            $q = $pdo->prepare('SELECT id,correct_option FROM quiz_questions WHERE quiz_id=? ORDER BY sort_order,id');
            $q->execute([$qid]);
            $questions = $q->fetchAll(PDO::FETCH_ASSOC);

            if (!$questions) {
                out(['success' => false, 'message' => 'Kuis belum memiliki soal.'], 422);
            }

            $q = $pdo->prepare('SELECT id FROM quiz_attempts WHERE quiz_id=? AND user_id=?');
            $q->execute([$qid, $uid]);
            if ($q->fetch()) {
                out(['success' => false, 'message' => 'Kuis ini sudah pernah dikerjakan.'], 409);
            }

            $correct = 0;
            foreach ($questions as $i => $question) {
                $ans = strtoupper($answers[(string) $question['id']] ?? $answers[$i] ?? '');
                if ($ans === $question['correct_option']) {
                    $correct++;
                }
            }

            $total = count($questions);
            $points = $correct * 10;
            $score = (int) round($correct / $total * 100);

            $pdo->beginTransaction();
            $ins = $pdo->prepare('INSERT INTO quiz_attempts(quiz_id,user_id,score,correct_count,total_questions,points_awarded) VALUES(?,?,?,?,?,?)');
            $ins->execute([$qid, $uid, $score, $correct, $total, $points]);
            if ($points > 0) {
                addPoints($pdo, $uid, $points, "Reward kuis: {$correct} jawaban benar", 'quiz', $qid);
            }
            $pdo->commit();

            out(['success' => true, 'score' => $score, 'correct_count' => $correct, 'total_questions' => $total, 'points_awarded' => $points, 'message' => "Kuis selesai! Kamu mendapat {$points} poin reward."]);
        }

        if ($action === 'redeem') {
            needRole($role, 'peserta');
            $rid = (int) ($d['reward_id'] ?? 0);

            $pdo->beginTransaction();
            $lock = $pdo->prepare('SELECT id FROM users WHERE id=? FOR UPDATE');
            $lock->execute([$uid]);

            $q = $pdo->prepare('SELECT * FROM rewards WHERE id=? AND active=1 AND stock>0 FOR UPDATE');
            $q->execute([$rid]);
            $reward = $q->fetch(PDO::FETCH_ASSOC);

            if (!$reward) {
                $pdo->rollBack();
                out(['success' => false, 'message' => 'Voucher tidak tersedia.'], 404);
            }

            $q = $pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM points WHERE user_id=?');
            $q->execute([$uid]);
            $balance = (int) $q->fetchColumn();

            if ($balance < (int) $reward['points_required']) {
                $pdo->rollBack();
                out(['success' => false, 'message' => 'Poin reward kamu belum mencukupi.'], 422);
            }

            $code = 'LNV-' . strtoupper(bin2hex(random_bytes(4)));
            $q = $pdo->prepare("INSERT INTO redemptions(user_id,reward_id,status,voucher_code) VALUES(?,?,'approved',?)");
            $q->execute([$uid, $rid, $code]);

            $q = $pdo->prepare('UPDATE rewards SET stock=stock-1 WHERE id=?');
            $q->execute([$rid]);

            $q = $pdo->prepare('INSERT INTO points(user_id,amount,note,source,reference_id) VALUES(?,?,?,?,?)');
            $q->execute([$uid, -(int) $reward['points_required'], 'Penukaran ' . $reward['name'], 'redeem', (int) $pdo->lastInsertId()]);

            $pdo->commit();
            out(['success' => true, 'voucher_code' => $code, 'message' => 'Voucher berhasil ditukarkan. Simpan kode voucher kamu.']);
        }

        out(['success' => false, 'message' => 'Aksi POST tidak dikenal.'], 404);
    }

    out(['success' => false, 'message' => 'Metode tidak didukung.'], 405);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    out(['success' => false, 'message' => ($e instanceof PDOException ? 'Terjadi kesalahan database.' : $e->getMessage())], 500);
}
