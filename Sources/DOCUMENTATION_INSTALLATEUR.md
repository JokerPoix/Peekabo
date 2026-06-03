# Documentation Installateur - Peekaboo

## 1. Objectif

Peekaboo est une solution de suivi d'oiseaux par identifiant GPS. Le projet comprend :

- un backend API en Symfony expose sur le port `8000`;
- une base de donnees PostgreSQL;
- un frontend Vue 3 / Vite expose sur le port `8010`;
- un service `mover` qui simule l'envoi periodique de positions GPS;
- un script Python permettant de generer des QR codes.

Cette documentation explique comment reconstruire l'environnement de developpement a partir des sources fournies.

## 2. Pre-requis

Pour l'installation recommandee avec Docker :

- Docker Desktop;
- Docker Compose;
- un terminal PowerShell, CMD, Bash ou equivalent;
- les archives sources du projet.

Pour une installation manuelle hors Docker :

- PHP 8.1 ou compatible avec Symfony 5.4;
- Composer;
- PostgreSQL 14;
- Node.js 18 minimum, Node 22 recommande pour le frontend;
- npm;
- Python 3 avec les dependances `qrcode` et `Pillow`, uniquement pour le script QR code.

## 3. Structure des sources

Apres extraction des archives, l'arborescence attendue est la suivante :

```text
Peekabo/
  peekaboback/
    composer.json
    docker-compose.yml
    Dockerfile
    src/
    config/
    migrations/
    mover/
  peekabofront/
    package.json
    Dockerfile.front
    src/
    schemas/
  python/
    QR_code_generator.py
```

Le fichier `docker-compose.yml` se trouve dans `peekaboback` et orchestre le backend, PostgreSQL, le frontend et le simulateur GPS.

## 4. Installation recommandee avec Docker

### 4.1. Extraction des sources

Extraire les archives dans un meme dossier parent afin que `peekaboback` et `peekabofront` soient au meme niveau :

```bash
Peekabo/
  peekaboback/
  peekabofront/
  python/
```

### 4.2. Lancement de la solution

Depuis le dossier backend :

```bash
cd peekaboback
docker compose up --build
```

Selon la version de Docker Compose installee, la commande alternative peut etre :

```bash
docker-compose up --build
```

Au demarrage, le conteneur Symfony execute automatiquement :

- l'attente de PostgreSQL;
- la generation des cles JWT dans `config/jwt` si elles n'existent pas;
- la creation d'un fichier `.env.local` avec `JWT_PASSPHRASE=peekaboo` si necessaire;
- les migrations Doctrine;
- le chargement des fixtures;
- le lancement d'Apache.

### 4.3. Acces aux services

Une fois les conteneurs demarres :

- Frontend : `http://localhost:8010`
- Backend API : `http://localhost:8000`
- PostgreSQL : service interne `db`, base `app`, utilisateur `postgres`, mot de passe `postgres`

Le service `mover` envoie automatiquement une position GPS toutes les 20 secondes vers l'API pour l'identifiant `CAVAL01`.

## 5. Donnees de test

Les fixtures creent un utilisateur de test :

```text
Email : user@example.com
Mot de passe : password
```

Elles creent egalement quatre oiseaux :

```text
CAVAL01
CAVAL02
CAVAL03
CAVAL04
```

Chaque oiseau possede un historique de localisation de demonstration autour de la position de reference configuree dans les fixtures.

## 6. Verification de l'installation

### 6.1. Verification du frontend

Ouvrir :

```text
http://localhost:8010
```

L'interface doit afficher l'application Peekaboo. La connexion peut etre testee avec :

```text
user@example.com / password
```

### 6.2. Verification de l'API

Lister les oiseaux :

```bash
curl http://localhost:8000/birds
```

Recuperer la derniere position d'un oiseau :

```bash
curl http://localhost:8000/bird/1/location
```

Tester la connexion JWT :

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password\"}"
```

La reponse doit contenir un token JWT.

### 6.3. Verification du simulateur GPS

Dans les logs Docker, le conteneur `peekaboo_mover` doit afficher regulierement l'envoi de nouvelles positions. Si l'oiseau `CAVAL01` existe, l'API doit repondre avec succes.

## 7. Installation manuelle hors Docker

Cette methode est utile si Docker n'est pas disponible.

### 7.1. Backend Symfony

Creer une base PostgreSQL nommee `app`, puis se placer dans le dossier backend :

```bash
cd peekaboback
composer install
```

Creer ou adapter le fichier `.env.local` :

```text
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app
JWT_PASSPHRASE=peekaboo
```

Generer les cles JWT :

```bash
mkdir -p config/jwt
openssl genrsa -out config/jwt/private.pem -aes256 -passout pass:peekaboo 4096
openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem -passin pass:peekaboo
```

Executer les migrations et charger les donnees de test :

```bash
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load
```

Demarrer le backend :

```bash
symfony server:start --port=8000
```

Si le CLI Symfony n'est pas installe, utiliser un serveur web compatible PHP pointant vers le dossier `public`.

### 7.2. Frontend Vue/Vite

Dans un second terminal :

```bash
cd peekabofront
npm install
npm run generate-api
npm run dev
```

Le frontend demarre sur :

```text
http://localhost:8010
```

### 7.3. Simulateur GPS

Le simulateur se trouve dans `peekaboback/mover`. Il utilise les variables :

```text
API_URL=http://localhost:8000
GPS_ID=CAVAL01
```

Il peut etre lance via Docker avec la solution complete. Pour un lancement manuel, installer les dependances Node necessaires au script puis executer `mover.js` avec les variables d'environnement adaptees.

## 8. Script de generation de QR code

Le script se trouve dans :

```text
python/QR_code_generator.py
```

Installer les dependances :

```bash
pip install qrcode Pillow
```

Lancer le script :

```bash
python QR_code_generator.py
```

Le script demande :

- le texte ou l'URL a encoder;
- la couleur du QR code;
- la couleur de fond;
- le nom du fichier de sortie.

Il genere ensuite un fichier PNG dans le dossier courant.

## 9. Ports et variables principales

| Element | Valeur |
| --- | --- |
| Frontend | `http://localhost:8010` |
| Backend API | `http://localhost:8000` |
| PostgreSQL interne Docker | `db:5432` |
| Base PostgreSQL | `app` |
| Utilisateur PostgreSQL | `postgres` |
| Mot de passe PostgreSQL | `postgres` |
| Passphrase JWT dev | `peekaboo` |
| GPS ID simulateur | `CAVAL01` |

Remarque : dans `docker-compose.yml`, le port PostgreSQL est declare `5435:5435`, alors que le service backend attend PostgreSQL sur `db:5432`. L'application fonctionne via le reseau Docker interne sur `db:5432`. Si un acces PostgreSQL depuis la machine hote est necessaire, il est preferable d'exposer `5435:5432`.

## 10. Commandes utiles

Demarrer la solution :

```bash
cd peekaboback
docker compose up --build
```

Arreter les conteneurs :

```bash
docker compose down
```

Arreter les conteneurs et supprimer le volume de base de donnees :

```bash
docker compose down -v
```

Relancer les migrations dans le conteneur backend :

```bash
docker exec -it peekaboo_symfony php bin/console doctrine:migrations:migrate
```

Recharger les fixtures :

```bash
docker exec -it peekaboo_symfony php bin/console doctrine:fixtures:load
```

Regenerer les methodes API du frontend :

```bash
cd peekabofront
npm run generate-api
```

Construire le frontend :

```bash
cd peekabofront
npm run build
```

## 11. Depannage

### Le frontend ne communique pas avec le backend

Verifier que les conteneurs `peekaboo_front` et `peekaboo_symfony` sont demarres. En mode Docker, Vite utilise un proxy vers `http://peekaboo_symfony:80`.

### La connexion echoue

Verifier que les fixtures ont bien ete chargees et que l'utilisateur `user@example.com` existe. Recharger les fixtures si besoin :

```bash
docker exec -it peekaboo_symfony php bin/console doctrine:fixtures:load
```

### Erreur JWT

Verifier la presence des fichiers :

```text
peekaboback/config/jwt/private.pem
peekaboback/config/jwt/public.pem
```

Verifier aussi que `.env.local` contient :

```text
JWT_PASSPHRASE=peekaboo
```

### Base PostgreSQL inaccessible depuis l'hote

Si un outil local comme DBeaver ou pgAdmin doit acceder a la base, ajuster le mapping du service `db` dans `docker-compose.yml` :

```yaml
ports:
  - "5435:5432"
```

Puis relancer :

```bash
docker compose up --build
```

## 12. Elements a fournir dans le rendu

Dans le dossier `Sources`, fournir :

- les archives zip des sources : backend, frontend et script Python si separe;
- cette documentation installateur;
- toute note complementaire utile si une configuration locale particuliere a ete appliquee.

