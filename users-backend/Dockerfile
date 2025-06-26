FROM node:22-alpine AS base

WORKDIR /var/www/users-backend

RUN apk update && apk add --no-cache postgresql-client


FROM base AS development


CMD ["sh", "./start.sh"]


FROM base AS production

COPY . .

RUN npm install

CMD ["sh", "./start.sh"]
