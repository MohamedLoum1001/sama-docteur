# Utiliser une image Node.js stable (version 18 ou 20 conseillée)
FROM node:18-alpine

# Créer le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (sans installer les modules de dev pour alléger l'image)
RUN npm install --production

# Copier le reste du code source
COPY . .

# Exposer le port sur lequel ton serveur tourne (généralement 5000 ou 8080)
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["node", "index.js"]