FROM node:22-alpine AS base

# Définir le répertoire de travail
WORKDIR /var/www/frontend

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier le reste des fichiers
COPY . .

FROM base AS development

# Variables d'environnement pour le hot-reload
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV WDS_SOCKET_HOST=0.0.0.0
ENV WDS_SOCKET_PORT=3000
ENV FAST_REFRESH=true

# Lancer le serveur de développement
CMD ["npm", "start"]

FROM base AS production

RUN npm run build

# Créer le répertoire de distribution et donner les permissions
RUN mkdir -p /app/dist

CMD ["sh", "-c", "cp -r build/* /app/dist/ && tail -f /dev/null"]