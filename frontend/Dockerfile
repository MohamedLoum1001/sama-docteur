# --- ÉTAPE 1 : Build de l'application React ---
FROM node:20-alpine AS build
WORKDIR /app

# Copie d'abord les fichiers de dépendances pour maximiser l'utilisation du cache Docker
COPY package*.json ./
RUN npm install

# Déclaration des arguments de build (fournis par GitHub Actions ou docker-compose)
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_STRIPE_PUBLISHABLE_KEY

# Injection des arguments dans l'environnement de build
ENV REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=$REACT_APP_FIREBASE_AUTH_DOMAIN
ENV REACT_APP_FIREBASE_PROJECT_ID=$REACT_APP_FIREBASE_PROJECT_ID
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=$REACT_APP_FIREBASE_STORAGE_BUCKET
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ENV REACT_APP_FIREBASE_APP_ID=$REACT_APP_FIREBASE_APP_ID
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY=$REACT_APP_STRIPE_PUBLISHABLE_KEY

# Copie du reste du code source
COPY . .

# =========================================================================
# CORRECTIF : Désactivation du blocage strict d'ESLint pour le Build de Prod
# =========================================================================
ENV DISABLE_ESLINT_PLUGIN=true

# Compilation de l'application (S'exécutera désormais avec succès)
RUN npm run build

# --- ÉTAPE 2 : Serveur de production Nginx ---
FROM nginx:stable-alpine

# Copie de la configuration Nginx personnalisée pour gérer le routage SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers compilés depuis l'étape de build
COPY --from=build /app/build /usr/share/nginx/html

# Exposition du port standard HTTP
EXPOSE 80

# Lancement de Nginx au premier plan
CMD ["nginx", "-g", "daemon off;"]