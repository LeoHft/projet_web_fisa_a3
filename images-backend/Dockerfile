FROM node:22-alpine AS base

WORKDIR /var/www/images-backend


FROM base AS development

CMD ["npm", "run", "dev"]



FROM base AS production

# Copier SEULEMENT les fichiers de dépendances d'abord
COPY package*.json ./

RUN npm install

COPY . .


CMD ["npm", "run", "production"]