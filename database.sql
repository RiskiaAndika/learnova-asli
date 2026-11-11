CREATE DATABASE IF NOT EXISTS learnova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learnova;
CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL,
 role ENUM('peserta','penyelenggara','admin') NOT NULL DEFAULT 'peserta',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS classes (
 id INT AUTO_INCREMENT PRIMARY KEY,
 organizer_id INT NOT NULL,
 title VARCHAR(150) NOT NULL,
 description TEXT,
 schedule DATETIME NULL,
 status ENUM('draft','published') DEFAULT 'draft',
 FOREIGN KEY (organizer_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS points (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 amount INT NOT NULL,
 note VARCHAR(255),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS rewards (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(150) NOT NULL,
 description TEXT,
 points_required INT NOT NULL,
 stock INT NOT NULL DEFAULT 0,
 active BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS redemptions (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 reward_id INT NOT NULL,
 status ENUM('pending','approved','rejected') DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id),
 FOREIGN KEY (reward_id) REFERENCES rewards(id)
);
