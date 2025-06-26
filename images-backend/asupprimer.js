// Import de mongoose pour la connexion à MongoDB
const mongoose = require('mongoose');

// Import du schéma définis dans bdd.model.js
const { Task1 } = require('../images-backend/models/bdd.model');

// Connexion à la base MongoDB
mongoose.connect('mongodb://admin:password@mongodb:27017/projetweb?authSource=admin', {
    useNewUrlParser: true,       // Défini sur true pour utiliser le nouvel analyseur de chaînes de connexion MongoDB
    useUnifiedTopology: true     // Défini sur true pour utiliser le nouveau moteur de découverte et de surveillance des serveurs
}).then(async () => {
    console.log('Connexion réussie à MongoDB');

    // Force la création de la collection même sans documents
    // `init()` crée les indexes et valide les schémas
    await Promise.all([
        Task1.init()
    ]);

    console.log('Base de données initialisée');

    // Ferme proprement la connexion
    mongoose.connection.close();
}).catch(err => {
    // Affiche les erreurs de connexion si échec
    console.error('Erreur de connexion MongoDB :', err);
    process.exit(1); // Quitte avec code d'erreur
});