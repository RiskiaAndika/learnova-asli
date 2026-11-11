FROM php:8.2-cli

# Install ekstensi pdo_mysql
RUN docker-php-ext-install pdo pdo_mysql

# Copy semua file proyek
COPY . /app
WORKDIR /app

# Jalankan PHP built-in server di port dari Railway
CMD php -S 0.0.0.0:${PORT:-8080} -t /app
