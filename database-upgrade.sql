USE learnova;

-- Jalankan sekali setelah database.sql lama. Backup database sebelum migrasi.
ALTER TABLE classes
  ADD COLUMN access_type ENUM('free','paid') NOT NULL DEFAULT 'free',
  ADD COLUMN price DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE points
  ADD COLUMN source VARCHAR(40) NULL,
  ADD COLUMN reference_id INT NULL,
  ADD UNIQUE KEY uq_point_source (user_id,source,reference_id);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_status ENUM('free','pending','paid') NOT NULL DEFAULT 'free',
  payment_reference VARCHAR(60) NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrollment (class_id,user_id),
  CONSTRAINT fk_enroll_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_enroll_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  organizer_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quiz_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_teacher FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500) NOT NULL,
  option_d VARCHAR(500) NOT NULL,
  correct_option ENUM('A','B','C','D') NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  points_awarded INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_quiz_attempt (quiz_id,user_id),
  CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS monthly_awards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month_key CHAR(7) NOT NULL,
  rank_position INT NOT NULL,
  points_awarded INT NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_month_award (user_id,month_key),
  CONSTRAINT fk_award_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE redemptions
  ADD COLUMN voucher_code VARCHAR(40) NULL;

INSERT INTO rewards (name, description, points_required, stock, active)
SELECT 'Voucher Diskon Rp10.000', 'Voucher potongan Rp10.000 untuk pembelian kelas Learnova.', 500, 999999, 1
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE name='Voucher Diskon Rp10.000');

INSERT INTO rewards (name, description, points_required, stock, active)
SELECT 'Voucher Diskon Rp25.000', 'Voucher potongan Rp25.000 untuk pembelian kelas Learnova.', 1000, 999999, 1
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE name='Voucher Diskon Rp25.000');

INSERT INTO rewards (name, description, points_required, stock, active)
SELECT 'Voucher Diskon Rp50.000', 'Voucher potongan Rp50.000 untuk pembelian kelas Learnova.', 2000, 999999, 1
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE name='Voucher Diskon Rp50.000');
