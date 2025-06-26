#!/bin/sh
set -e

echo "On attend que la db postregreSQL se lance..."
until pg_isready -h postgres-messagesDB -p 5432 -U root -d messagesDB; do
  echo "la DB n'est pas prête - attente de 2 sec..."
  sleep 2
done

echo "La DB est prête"

echo "On lance les migrations"
npx knex migrate:latest --knexfile knexfile.js

echo "On lance les seeds"
npx knex seed:run --knexfile knexfile.js

echo "Lancement de l'application"
if [ "$NODE_ENV" = "production" ]; then
    echo "en mode production"
    npm run production
else
    echo "en mode développement"
    npm run dev
fi