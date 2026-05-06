# Étape 1 : Construction (Build)
FROM node:18-alpine as build-stage

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copie du code source et build
COPY . .
RUN npm run build

# Étape 2 : Production (Serveur Nginx)
FROM nginx:stable-alpine

# Copie des fichiers compilés depuis l'étape précédente vers le dossier Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Exposer le port 80 (port par défaut de Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]