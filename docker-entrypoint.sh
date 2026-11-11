#!/bin/bash
# Ganti port Apache sesuai variabel PORT dari Railway (default 80)
sed -i "s/Listen 80/Listen ${PORT:-80}/" /etc/apache2/ports.conf
sed -i "s/:80/:${PORT:-80}/" /etc/apache2/sites-available/000-default.conf

# Jalankan Apache
exec apache2-foreground
