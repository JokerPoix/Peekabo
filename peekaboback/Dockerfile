# Utilise une image PHP avec Apache et Composer
FROM php:8.1-apache

# Installe les extensions nécessaires
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Copie les fichiers de l'application
COPY . /var/www/html

# Définit le répertoire de travail
WORKDIR /var/www/html

# Installe Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Installe les dépendances Symfony
RUN composer install

# Définit les droits pour Apache
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Active le module Apache rewrite
RUN a2enmod rewrite
