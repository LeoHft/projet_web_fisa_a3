FROM node:22-alpine AS base

WORKDIR /var/www/posts-backend

RUN apk update && apk add --no-cache postgresql-client

FROM base AS development

CMD ["sh", "./start.sh"]



FROM base AS production

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "./start.sh"]
