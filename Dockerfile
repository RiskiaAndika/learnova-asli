FROM php:8.2-apache

# Install ekstensi pdo_mysql
RUN docker-php-ext-install pdo pdo_mysql

# Aktifkan mod_rewrite
RUN a2enmod rewrite

# Nonaktifkan MPM event/worker, pastikan hanya mpm_prefork yang aktif
RUN a2dismod mpm_event mpm_worker 2>/dev/null; a2enmod mpm_prefork

# Izinkan .htaccess override
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy semua file proyek ke document root Apache
COPY . /var/www/html/

# Pastikan Apache bisa baca semua file
RUN chown -R www-data:www-data /var/www/html

# Copy entrypoint script dan beri permission
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["docker-entrypoint.sh"]
