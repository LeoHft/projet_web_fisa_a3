const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Follows = require("../models/follows.model");
const User = require("../models/users.model");
const axios = require("axios");

module.exports = {
  getUsersByIds: async (req, res) => {
    try {
      const { userIds } = req.body; // Tableau d'IDs passé dans le body

      if (!userIds || !Array.isArray(userIds)) {
        return res
          .status(400)
          .json({ message: "userIds doit être un tableau" });
      }

      const users = await User.query()
        .select("id", "username", "bio", "roleId", "email")
        .whereIn("id", userIds);

      return res.status(200).json(users);
    } catch (error) {
      console.error("Erreur dans getUsersByIds:", error);
      return res.status(500).json({
        message: "Erreur lors de la récupération des utilisateurs",
        error: error.message,
      });
    }
  },

  getUser: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let userId;

      if (!req.params.userId) {
        // Authenticated user (no userId in URL)
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res
            .status(401)
            .json({ message: "Token manquant ou invalide" });
        }

        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
          return res
            .status(500)
            .json({ message: "Erreur de configuration du serveur" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
          !decoded?.id ||
          !decoded?.username ||
          !decoded?.email ||
          !decoded?.roleId
        ) {
          return res
            .status(401)
            .json({ message: "Token invalide ou incomplet" });
        }

        userId = decoded.id;
      } else {
        // Explicit userId from URL
        userId = req.params.userId;
      }

      const user = await User.query()
        .select("username", "bio", "roleId", "email") // exclut mot de passe
        .findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      return res.status(200).json({
        username: user.username,
        bio: user.bio,
        roleId: user.roleId,
        email: user.email,
      });
    } catch (error) {
      console.error("Erreur dans getUser:", error);
      return res.status(500).json({
        message: "Erreur lors de la récupération de l'utilisateur",
        error: error.message,
      });
    }
  },

  searchUsers: async (req, res) => {
    try {
      const query = req.query.query;

      if (!query || query.length < 1) {
        return res
          .status(400)
          .json({ message: "La requête doit contenir au moins 1 caractère" });
      }

      const users = await User.query()
        .select("id", "username", "bio")
        .where("username", "like", `%${query}%`)
        .orWhere("bio", "like", `%${query}%`);

      return res.status(200).json(users);
    } catch (error) {
      console.error("Erreur dans searchUsers:", error);
      return res.status(500).json({
        message: "Erreur lors de la recherche d'utilisateurs",
        error: error.message,
      });
    }
  },

  searchValidateUsers: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant ou invalide" });
    }
    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Erreur de configuration du serveur" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.roleId !== 1) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    try {
      const query = req.query.query;

      const users = await User.query()
        .select("id", "username", "bio")
        .where("username", "like", `%${query}%`)
        .andWhere("completed", false)
        .andWhereNot("roleId", 1); 

      return res.status(200).json(users);
    } catch (error) {
      console.error("Erreur dans searchUsers:", error);
      return res.status(500).json({
        message: "Erreur lors de la recherche d'utilisateurs",
        error: error.message,
      });
    }
  },

  searchBanUsers: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant ou invalide" });
    }
    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Erreur de configuration du serveur" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.roleId !== 1) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    try {
      const query = req.query.query;

      const users = await User.query()
        .select("id", "username", "bio")
        .where("username", "like", `%${query}%`)
        .andWhere("completed", true)
        .andWhereNot("roleId", 1);

      return res.status(200).json(users);
    } catch (error) {
      console.error("Erreur dans searchUsers:", error);
      return res.status(500).json({
        message: "Erreur lors de la recherche d'utilisateurs",
        error: error.message,
      });
    }
  },

  banUser: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant ou invalide" });
    }
    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Erreur de configuration du serveur" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.roleId !== 1) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    try {
      const userId = req.body.userId;
      const user = await User.query().findById(userId);

      console.log("Bannissement de l'utilisateur:", userId);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non rencontré" });
      }

      user.completed = false;
      await user.$query().update();

      return res.status(200).json({ message: "Utilisateur banni avec successe" });
    } catch (error) {
      console.error("Erreur dans banUser:", error);
      return res.status(500).json({
        message: "Erreur lors du bannissement de l'utilisateur",
        error: error.message,
      });
    }
  },

  validateUser: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant ou invalide" });
    }
    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Erreur de configuration du serveur" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.roleId !== 1) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    try {
      const userId = req.body.userId;
      const user = await User.query().findById(userId);

      console.log("Validation de l'utilisateur:", userId);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.completed = true;
      await user.$query().update();

      return res.status(200).json({ message: "Utilisateur validé" });
    } catch (error) {
      console.error("Erreur dans validateUser:", error);
      return res.status(500).json({
        message: "Erreur lors de la validation de l'utilisateur",
        error: error.message,
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      const hashedPassword = await bcrypt.hash(password, 10); 

      let roleId;
      if (role === "admin") {
        roleId = 1;
      } else if (role === "moderator") {
        roleId = 2;
      } else if (role === "user") {
        roleId = 3;
      } else {
        return res.status(400).json({ message: "Rôle invalide" });
      }

      const user = await User.query().insert({
        username,
        email,
        password: hashedPassword,
        roleId,
        completed: true, 
      })
      .returning(["id", "username", "email", "roleId"]);

      return res.status(201).json(user);
    } catch (error) {
      console.error("Erreur dans createUser:", error);
      return res.status(500).json({
        message: "Erreur lors de la création de l'utilisateur",
        error: error.message,
      });
    }
  },

  getFriends: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant ou invalide" });
      }

      const token = authHeader.substring(7);
      if (!process.env.JWT_SECRET) {
        return res
          .status(500)
          .json({ message: "Erreur de configuration du serveur" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) {
        return res.status(401).json({ message: "Token invalide ou incomplet" });
      }

      const userId = decoded.id;

      // Récupérer les utilisateurs que l'utilisateur suit
      const following = await Follows.query()
        .select("followedId")
        .where("followerId", userId);

      // Récupérer les utilisateurs qui suivent l'utilisateur
      const followers = await Follows.query()
        .select("followerId")
        .where("followedId", userId);

      // Extraire les IDs
      const followingIds = following.map((f) => f.followedId);
      const followerIds = followers.map((f) => f.followerId);

      // Trouver les IDs communs (mutual follows)
      const mutualFriendIds = followingIds.filter((id) =>
        followerIds.includes(id)
      );

      // Facultatif : Récupérer les infos des utilisateurs amis
      const friends = await User.query()
        .select("id", "username", "email")
        .whereIn("id", mutualFriendIds);

      return res.status(200).json(friends);
    } catch (error) {
      console.error("Erreur dans getFriends:", error);
      return res.status(500).json({
        message: "Erreur lors de la récupération des amis",
        error: error.message,
      });
    }
  },
  editBio: async (req, res) => {
    try {
      const { bio, type } = req.body;
      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const id = decoded.id;
      console.log("Type");
      console.log(type);
      if (type === 4) {
        const updatedBio = await User.query().patchAndFetchById(id, {
          bio,
          updatedAt: new Date().toISOString(),
        });
        return res.status(200).json({ message: 'Post mis à jour avec succès', post: updatedBio });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de la bio', error: error.message });
    }
  },

};

const decodeTokenFromHeader = (authHeader) => {
  console.log(authHeader);
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