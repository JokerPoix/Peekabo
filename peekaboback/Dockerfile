# Étape 1 : Builder Composer pour l'injecter dans l'image finale
FROM composer:latest AS composer_stage

# Étape 2 : Image Symfony avec Apache
FROM php:8.1-apache

# Installer les extensions PHP et outils nécessaires
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    zip \
    postgresql-client \
    netcat-openbsd \
    && docker-php-ext-install pdo pdo_pgsql

# Active le module Apache rewrite
RUN a2enmod rewrite

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier les sources du projet Symfony
COPY . /var/www/html

# Copier Composer depuis le stage précédent
COPY --from=composer_stage /usr/bin/composer /usr/bin/composer

# Installer les dépendances Symfony
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Droits pour Apache
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Définir le DocumentRoot sur /public si besoin
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Copier le script d'initialisation
COPY docker/init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

# Commande de démarrage
CMD ["/usr/local/bin/init.sh"]
