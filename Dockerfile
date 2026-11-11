FROM php:8.2-apache

# Install ekstensi pdo_mysql
RUN docker-php-ext-install pdo pdo_mysql

# Aktifkan mod_rewrite Apache
RUN a2enmod rewrite

# Copy semua file proyek ke document root Apache
COPY . /var/www/html/

# Pastikan Apache bisa baca semua file
RUN chown -R www-data:www-data /var/www/html

# Railway menggunakan variabel PORT (default 80)
# Konfigurasi Apache agar listen di $PORT
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Izinkan .htaccess override
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

EXPOSE 80

CMD ["apache2-foreground"]
