-- =====================================================================
-- DATABASE SCHEMA: Learnova (PostgreSQL)
-- Hasil konversi dan penggabungan dari database.sql & database-upgrade.sql
-- =====================================================================

-- 1. PEMBUATAN DATABASE (Jalankan terpisah jika belum ada database learnova)
-- CREATE DATABASE learnova WITH ENCODING 'UTF8';
-- \c learnova;

-- 2. ENUM TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('peserta', 'penyelenggara', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_status') THEN
        CREATE TYPE class_status AS ENUM ('draft', 'published');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_access_type') THEN
        CREATE TYPE class_access_type AS ENUM ('free', 'paid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'redemption_status') THEN
        CREATE TYPE redemption_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('free', 'pending', 'paid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_option') THEN
        CREATE TYPE quiz_option AS ENUM ('A', 'B', 'C', 'D');
    END IF;
END $$;

-- 3. TRIGGER FUNCTION UNTUK AUTO UPDATE TIMESTAMP (updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABEL USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'peserta',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    organizer_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    schedule TIMESTAMP NULL,
    status class_status NOT NULL DEFAULT 'draft',
    access_type class_access_type NOT NULL DEFAULT 'free',
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_classes_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_classes_updated_at ON classes;
CREATE TRIGGER trg_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. TABEL POINTS
CREATE TABLE IF NOT EXISTS points (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    amount INT NOT NULL,
    note VARCHAR(255),
    source VARCHAR(40) NULL,
    reference_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_point_source UNIQUE (user_id, source, reference_id),
    CONSTRAINT fk_points_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. TABEL REWARDS
CREATE TABLE IF NOT EXISTS rewards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    points_required INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. TABEL REDEMPTIONS
CREATE TABLE IF NOT EXISTS redemptions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    reward_id INT NOT NULL,
    status redemption_status NOT NULL DEFAULT 'pending',
    voucher_code VARCHAR(40) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_redemptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_redemptions_reward FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- 9. TABEL ENROLLMENTS
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'free',
    payment_reference VARCHAR(60) NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_enrollment UNIQUE (class_id, user_id),
    CONSTRAINT fk_enroll_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. TABEL QUIZZES
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL,
    organizer_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_teacher FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. TABEL QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_option quiz_option NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 12. TABEL QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL,
    user_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    points_awarded INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_quiz_attempt UNIQUE (quiz_id, user_id),
    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. TABEL MONTHLY AWARDS
CREATE TABLE IF NOT EXISTS monthly_awards (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    month_key CHAR(7) NOT NULL,
    rank_position INT NOT NULL,
    points_awarded INT NOT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_month_award UNIQUE (user_id, month_key),
    CONSTRAINT fk_award_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. INDEXES UNTUK PERFORMA FOREIGN KEY & QUERY
CREATE INDEX IF NOT EXISTS idx_classes_organizer ON classes(organizer_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_points_user ON points(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward ON redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_class ON quizzes(class_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_organizer ON quizzes(organizer_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_awards_user ON monthly_awards(user_id);

-- 15. SEED DATA REWARDS
INSERT INTO rewards (name, description, points_required, stock, active)
SELECT 'Voucher Diskon Rp10.000', 'Voucher potongan Rp10.000 untuk pembelian kelas Learnova.', 500, 999999, TRUE
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE name = 'Voucher Diskon Rp10.000');

INSERT INTO rewards (name, description, points_required, stock, active)
SELECT 'Voucher Diskon Rp25.000', 'Voucher potongan Rp25.000 untuk pembelian kelas Learnova.', 1000, 999999, TRUE
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE name = 'Voucher Diskon Rp25.000');

INSERT INTO rewards (name, description, points_required, stock, active)
SELECT 'Voucher Diskon Rp50.000', 'Voucher potongan Rp50.000 untuk pembelian kelas Learnova.', 2000, 999999, TRUE
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE name = 'Voucher Diskon Rp50.000');
