# Peekaboo - Front Interface

Cette interface utilise :
- **Node.js** : Environnement d'exécution JavaScript côté serveur. (Node 22)
- **Vite** : Outil de build rapide pour les projets front-end. (https://vite.dev/config/)
- **Vue** : Framework JavaScript pour construire des interfaces utilisateur. (https://vuejs.org/guide/quick-start.html)
- **Orval** : Générateur de methodes TypeScript basé sur OpenAPI. (https://orval.dev/)


## Installation du Projet


- Installer les packages NPM et dépendences : 

```bash
cd webui/
```

```bash
npm install
```


- Installer Orval :

```bash
cd webui/
```

```bash
npm i orval -D
```

### Generer les méthodes TypeScript aec Orval : 

*Le fichier de configuration Orval doit indiqué en "input", le dossier où est stocké le schéma "openapi.yaml", et en "output" : src/api/*

(if the job is scripts{"generate-api"} in package.json)
```bash
npm run generate-api
```
Else

```bash
npm run dev
```

Pour actualiser, supprimer les fichiers TypeScript dans /src/api et refaire la commande : 


(if the job is scripts{"generate-api"} in package.json)
```bash
npm run generate-api
```


## Lancement du Projet :

```bash
cd webui/
```


```bash
npm run dev
```


## Details

- **GPS Map : Leaflet**

https://github.com/Leaflet/Leaflet


- **Responsive Desing for Mobile and Laptop Usage : VueX**
https://medium.com/@devdude/handling-screen-media-queries-for-js-on-a-vue-js-project-357e40fb1c77
https://vuex.vuejs.org/