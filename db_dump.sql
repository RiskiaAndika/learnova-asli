-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 11 Nov 2026 pada 13.42
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learnova`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `organizer_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `schedule` datetime DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `access_type` enum('free','paid') NOT NULL DEFAULT 'free',
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `classes`
--

INSERT INTO `classes` (`id`, `organizer_id`, `title`, `description`, `schedule`, `status`, `access_type`, `price`, `updated_at`) VALUES
(4, 2, 'Web devolopment', 'pembuatan website', '2027-01-06 00:30:00', 'published', 'paid', 25001.00, '2026-11-11 05:12:10');

-- --------------------------------------------------------

--
-- Struktur dari tabel `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_status` enum('free','pending','paid') NOT NULL DEFAULT 'free',
  `payment_reference` varchar(60) DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `enrollments`
--

INSERT INTO `enrollments` (`id`, `class_id`, `user_id`, `payment_status`, `payment_reference`, `joined_at`) VALUES
(3, 4, 3, 'paid', 'LNV26111106183000034', '2026-11-11 05:18:30');

-- --------------------------------------------------------

--
-- Struktur dari tabel `monthly_awards`
--

CREATE TABLE `monthly_awards` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `month_key` char(7) NOT NULL,
  `rank_position` int(11) NOT NULL,
  `points_awarded` int(11) NOT NULL,
  `awarded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `points`
--

CREATE TABLE `points` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `source` varchar(40) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `points`
--

INSERT INTO `points` (`id`, `user_id`, `amount`, `note`, `created_at`, `source`, `reference_id`) VALUES
(1, 1, 20, 'Reward bergabung kelas', '2026-11-05 23:22:01', 'class_join', 1),
(2, 1, 20, 'Reward kuis: 2 jawaban benar', '2026-11-05 23:26:44', 'quiz', 1),
(3, 1, 40, 'Reward kuis: 4 jawaban benar', '2026-11-05 23:43:35', 'quiz', 2),
(4, 1, 20, 'Reward kuis: 2 jawaban benar', '2026-11-05 23:56:02', 'quiz', 3),
(5, 1, 20, 'Reward kuis: 2 jawaban benar', '2026-11-06 00:04:00', 'quiz', 4),
(6, 1, 20, 'Reward bergabung kelas berbayar', '2026-11-06 00:15:51', 'class_join', 2),
(7, 3, 20, 'Reward bergabung kelas berbayar', '2026-11-11 05:18:38', 'class_join', 4),
(8, 3, 20, 'Reward kuis: 2 jawaban benar', '2026-11-11 05:19:03', 'quiz', 6);

-- --------------------------------------------------------

--
-- Struktur dari tabel `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `organizer_id` int(11) NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `quizzes`
--

INSERT INTO `quizzes` (`id`, `class_id`, `organizer_id`, `title`, `description`, `is_published`, `created_at`) VALUES
(6, 4, 2, 'HTML dasar', 'pengetahuan html', 1, '2026-11-11 05:17:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `correct_count` int(11) NOT NULL DEFAULT 0,
  `total_questions` int(11) NOT NULL DEFAULT 0,
  `points_awarded` int(11) NOT NULL DEFAULT 0,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `quiz_id`, `user_id`, `score`, `correct_count`, `total_questions`, `points_awarded`, `submitted_at`) VALUES
(5, 6, 3, 100, 2, 2, 20, '2026-11-11 05:19:03');

-- --------------------------------------------------------

--
-- Struktur dari tabel `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `option_a` varchar(500) NOT NULL,
  `option_b` varchar(500) NOT NULL,
  `option_c` varchar(500) NOT NULL,
  `option_d` varchar(500) NOT NULL,
  `correct_option` enum('A','B','C','D') NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `sort_order`) VALUES
(15, 6, 'Kepanjangan dari HTML adalah?', 'HyperText Markup Language', 'High Tech Modern Language', 'HyperTool Making Logic', 'Home Text Mark Language', 'A', 1),
(16, 6, 'untuk membuat struktur dasar HTML secara otomatis memakai tanda?', '?', '!', '/', '\\', 'B', 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `redemptions`
--

CREATE TABLE `redemptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reward_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `voucher_code` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `rewards`
--

CREATE TABLE `rewards` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `points_required` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `rewards`
--

INSERT INTO `rewards` (`id`, `name`, `description`, `points_required`, `stock`, `active`) VALUES
(1, 'Voucher Diskon Rp10.000', 'Voucher potongan Rp10.000 untuk pembelian kelas Learnova.', 500, 999999, 1),
(2, 'Voucher Diskon Rp25.000', 'Voucher potongan Rp25.000 untuk pembelian kelas Learnova.', 1000, 999999, 1),
(3, 'Voucher Diskon Rp50.000', 'Voucher potongan Rp50.000 untuk pembelian kelas Learnova.', 2000, 999999, 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('peserta','penyelenggara','admin') NOT NULL DEFAULT 'peserta',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'andika', 'andika@gmail.com', '$2y$10$JYkfxTqff5YgIQ8ULwCa.uaPMsEeG.tNEj7m2I.xBuS2NiJd5Bvhy', 'peserta', '2026-11-05 22:34:46'),
(2, 'dikaRisk', 'andika12@gmail.com', '$2y$10$Xf/q7B4rzPG2LV9cnOJIP./cDiUlJj5tc5fYSIi0FqiLBCPHAEniy', 'penyelenggara', '2026-11-05 22:36:36'),
(3, 'Andika', 'andika123@gmail.com', '$2y$10$MGXBVaaBTq.LBxYh168QEuRISQLFivYX253txGAMSSltwZZg6uoCe', 'peserta', '2026-11-11 04:50:07');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizer_id` (`organizer_id`);

--
-- Indeks untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_enrollment` (`class_id`,`user_id`),
  ADD KEY `fk_enroll_user` (`user_id`);

--
-- Indeks untuk tabel `monthly_awards`
--
ALTER TABLE `monthly_awards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_month_award` (`user_id`,`month_key`);

--
-- Indeks untuk tabel `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_point_source` (`user_id`,`source`,`reference_id`);

--
-- Indeks untuk tabel `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_quiz_class` (`class_id`),
  ADD KEY `fk_quiz_teacher` (`organizer_id`);

--
-- Indeks untuk tabel `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quiz_attempt` (`quiz_id`,`user_id`),
  ADD KEY `fk_attempt_user` (`user_id`);

--
-- Indeks untuk tabel `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_question_quiz` (`quiz_id`);

--
-- Indeks untuk tabel `redemptions`
--
ALTER TABLE `redemptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `reward_id` (`reward_id`);

--
-- Indeks untuk tabel `rewards`
--
ALTER TABLE `rewards`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `monthly_awards`
--
ALTER TABLE `monthly_awards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `points`
--
ALTER TABLE `points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `redemptions`
--
ALTER TABLE `redemptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `rewards`
--
ALTER TABLE `rewards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enroll_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enroll_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `monthly_awards`
--
ALTER TABLE `monthly_awards`
  ADD CONSTRAINT `fk_award_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `points`
--
ALTER TABLE `points`
  ADD CONSTRAINT `points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `fk_quiz_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quiz_teacher` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `fk_attempt_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `redemptions`
--
ALTER TABLE `redemptions`
  ADD CONSTRAINT `redemptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `redemptions_ibfk_2` FOREIGN KEY (`reward_id`) REFERENCES `rewards` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
