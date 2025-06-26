const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Follows = require("../models/follows.model");
const User = require("../models/users.model");
const axios = require("axios");

module.exports = {
  followUser: async (req, res) => {
    console.log("followUser called");
    console.log("Request params:", req.params);
    try {
      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const followerId = decoded.id;
      const { userId } = req.params;
      const followedId = parseInt(userId, 10);
      console.log("Follower ID:", followerId);
      console.log("Followed ID:", followedId);
      if (!followerId || !followedId) {
        return res
          .status(400)
          .json({ message: "ID de l'utilisateur à suivre manquant" });
      }
      const existingFollow = await Follows.query().findOne({
        followerId,
        followedId,
      });
      if (existingFollow) {
        return res
          .status(400)
          .json({ message: "Vous suivez déjà cet utilisateur" });
      }
      const newFollow = await Follows.query().insert({
        followerId,
        followedId,
      });
      return res
        .status(201)
        .json({ message: "Utilisateur suivi avec succès", follow: newFollow });
    } catch (error) {
      console.error("Error in followUser:", error);
      return res
        .status(500)
        .json({
          message: "Erreur lors de la récupération de l'utilisateur",
          error: error.message,
        });
    }
  },
  unFollowUser: async (req, res) => {
    console.log("unFollowUser called");
    console.log("Request params:", req.params);
    try {
      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const followerId = decoded.id;
      const { userId } = req.params;
      const followedId = userId;

      if (!followerId || !followedId) {
        return res
          .status(400)
          .json({ message: "ID de l'utilisateur à ne plus suivre manquant" });
      }

      const existingFollow = await Follows.query().findOne({
        followerId,
        followedId,
      });
      if (!existingFollow) {
        return res
          .status(404)
          .json({ message: "Vous ne suivez pas cet utilisateur" });
      }
      await Follows.query().delete().where({ followerId, followedId });
      return res.status(200).json({ message: "Contact supprimé avec succès" });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Erreur lors de la récupération de l'utilisateur",
          error: error.message,
        });
    }
  },

  // Récupérer les abonnés de l'utilisateur connecté
  getFollowers: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let userId;
      let followers;

      if (!req.params.userId) {
        const decoded = decodeTokenFromHeader(authHeader);
        userId = decoded.id;
      } else {
        userId = req.params.userId;
      }

      if (!userId) {
        return res
          .status(400)
          .json({ message: "ID de l'utilisateur manquant" });
      }

      if (!req.params.userId) {
        followers = await Follows.query()
          .where("followedId", userId)
          .withGraphFetched("follower");
      } else {
        followers = await Follows.query().where("followedId", userId);
      }

      const followersCount = followers.length;

      return res
        .status(200)
        .json({
          message: "Abonnés récupérés avec succès",
          followers,
          followersCount,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Erreur lors de la récupération des abonnés",
          error: error.message,
        });
    }
  },

  // Récupérer les utilisateurs qui sont suivis par l'utilisateur connecté
  getFollowings: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let userId;
      let followings;

      if (!req.params.userId) {
        const decoded = decodeTokenFromHeader(authHeader);
        userId = decoded.id;
      } else {
        userId = req.params.userId;
      }

      console.log("getFollowings called for user:", userId);

      if (!req.params.userId) {
        followings = await Follows.query()
          .where("followerId", userId)
          .withGraphFetched("followed");
      } else {
        followings = await Follows.query().where("followerId", userId);
      }

      if (!followings || followings.length === 0) {
        return res.status(200).json({
          message: "Aucun abonnement trouvé",
          followings: [],
          followingsCount: 0,
        });
      }

      const followedIds = followings.map((following) => following.followedId);

      const followingsNames = await User.query()
        .whereIn("id", followedIds)
        .select("id", "username");

      const followingsCount = followings.length;

      return res.status(200).json({
        message: "Abonnements récupérés avec succès",
        followings: followingsNames,
        followingsCount,
      });
    } catch (error) {
      console.error("Error in getFollowings:", error);
      return res.status(500).json({
        message: "Erreur lors de la récupération des abonnements",
        error: error.message,
      });
    }
  },
};

const decodeTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token manquant ou invalide");
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  if (!process.env.JWT_SECRET) {
    throw new Error("Erreur de configuration du serveur");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { id, email, username, roleId } = decoded;

  if (!id || !email || !username || !roleId) {
    throw new Error("Token invalide");
  }

  return { id, email, username, roleId };
};
