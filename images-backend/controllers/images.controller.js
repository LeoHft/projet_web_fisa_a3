const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { Task1 }= require('../models/images.model');

module.exports = {
    getUserPicture: async (req,res) => {
        try{
            let userId;

            if (!req.params.userId) {
                const authHeader = req.headers.authorization;
                const decoded = decodeTokenFromHeader(authHeader);
                userId = decoded.id;
            } else {
                userId = req.params.userId;
            }

            //const image = await Task1.findOne({ user_id: userId });
            const image = await Task1.findOne({ user_id: userId }).select('profile_picture').lean();
            if(!image || !image.profile_picture){
                const img=' ';
                res.status(200).json(img);
            }

            const base64Image = image.profile_picture.toString("base64");
            res.status(200).json({image: base64Image});
        } catch(error) {
            res.status(500).json({ message: 'Erreur lors de la récupération de la photo de profil', error: error.message });
        }
    },


    getUsersPictures: async (req, res) => {
        try {
            const { userIds } = req.body;

            if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(200).json({ message: 'Liste des IDs manquante ou vide' });
            }

            // Récupère toutes les images des utilisateurs en une seule requête
            const images = await Task1.find({ user_id: { $in: userIds } })
            .select('user_id profile_picture')
            .lean();

            const imagesMap = {};

            userIds.forEach(id => {
            const userImage = images.find(img => img.user_id === id);
            imagesMap[id] = userImage && userImage.profile_picture
                ? userImage.profile_picture.toString('base64')
                : null;
            });

            return res.status(200).json({ images: imagesMap });
        } catch (error) {
            return res.status(500).json({ message: 'Erreur lors de la récupération des images', error: error.message });
        }
    },



    postUserPicture: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const decoded = decodeTokenFromHeader(authHeader);
            const userId = decoded.id;

            const { image } = req.body;


            if (!image) {
            return res.status(400).json({ message: "Aucune image fournie" });
            }

            const buffer = Buffer.from(image, 'base64');

            const update = {
            user_id: userId,
            profile_picture: buffer
            };

            const updatePhoto = await Task1.findOneAndUpdate(
            { user_id: userId },
            update,
            { upsert: true, new: true }
            );

            res.status(201).json({ message: "Image sauvegardée avec succès" });
        } catch (error) {
            console.error("ERREUR SERVER:", error);
            res.status(500).json({ message: "Erreur lors de la sauvegarde de la photo de profil", error: error.message });
        }
    }





}

const decodeTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token manquant ou invalide');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!process.env.JWT_SECRET) {
        throw new Error('Erreur de configuration du serveur');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id, email, username, roleId } = decoded;

    if (!id || !email || !username || !roleId) {
        throw new Error('Token invalide');
    }

    return { id, email, username, roleId };
};