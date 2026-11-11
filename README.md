## Teknologi
- PHP Native + PDO
- MySQL / MariaDB
- HTML, CSS, JavaScript
- XAMPP

## Cara memasang dengan project lama
1. Backup folder `Learnova` dan database `learnova` terlebih dahulu.
2. Ekstrak folder `Learnova` dari ZIP ini ke `C:/xampp/htdocs/`.
3. Jika kamu sudah memakai database lama, buka phpMyAdmin → database `learnova` → tab Import → impor `database-upgrade.sql` **satu kali saja**.
4. Jika database belum pernah dibuat, impor `database.sql` terlebih dahulu, lalu impor `database-upgrade.sql`.
5. Pastikan Apache dan MySQL aktif.
6. Buka `http://localhost/Learnova/index.html`.
7. Login menggunakan akun murid atau pengajar yang sudah terdaftar.