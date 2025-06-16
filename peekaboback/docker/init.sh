#!/bin/bash

set -e

echo "🔄 Initialisation du conteneur Symfony..."

# Attendre que la base PostgreSQL soit prête
echo "⏳ Attente de PostgreSQL..."
until nc -z db 5432; do
  echo "   ⏳ En attente de PostgreSQL sur db:5432..."
  sleep 2
done
echo "✅ PostgreSQL est prêt."

# Générer les clés JWT si elles n'existent pas
if [ ! -f config/jwt/private.pem ]; then
  echo "🔐 Génération des clés JWT..."
  mkdir -p config/jwt
  openssl genrsa -out config/jwt/private.pem -aes256 -passout pass:peekaboo 4096
  openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem -passin pass:peekaboo
  chown www-data:www-data config/jwt/private.pem config/jwt/public.pem
  chmod 600 config/jwt/private.pem
  echo "✅ Clés JWT générées."
else
  echo "ℹ️ Clés JWT déjà présentes."
fi

# Vérification présence du .env.local
if [ ! -f .env.local ]; then
  echo "📄 Création du fichier .env.local"
  echo "JWT_PASSPHRASE=peekaboo" > .env.local
fi

# Migration de la base
echo "📦 Migration de la base de données..."
php bin/console doctrine:migrations:migrate --no-interaction || true

# Chargement des fixtures si souhaité
echo "🐣 Chargement des fixtures..."
php bin/console doctrine:fixtures:load --no-interaction || true

# Lancement du serveur Apache
echo "🚀 Lancement d'Apache..."
exec apache2-foreground
