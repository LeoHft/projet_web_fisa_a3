const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users.model");
const Role = require("../models/roles.model");
const crypto = require("crypto");

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }
      // Vérification du format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Format d'email invalide" });
      }

      const existingUser = await User.query().findOne({ username });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Nom d'utilisateur déjà utilisé" });
      }
      const existingEmail = await User.query().findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ message: "Email déjà utilisé" });
      }
      // Regex : 12 caractères minimum, au moins un chiffre, au moins un caractère spécial
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const defaultRole = await Role.query().findOne({ name: "utilisateur" });
      if (!defaultRole) {
        throw new Error("Rôle par défaut introuvable");
      }

      const user = await User.query().insert({
        username,
        password: hashedPassword,
        email,
        roleId: defaultRole.id,
      });

      return module.exports.generateJwtToken(
        user,
        res,
        "Votre compte a été créé avec succès !"
      );
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la création de l'utilisateur",
          error: error.message,
        });
    }
  },

  login: async (req, res) => {
    try {
      const { password, email } = req.body;

      const user = await User.query().where("email", email).first();

      const adminRole = await Role.query().findOne({ name: "administrateur" });

      // Vérification du mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      if (!user || (!user.completed && !(user.roleId === adminRole.id))) {
        return res
          .status(401)
          .json({ message: "Veuillez attendre la validation de votre compte" });
      }
      await User.query()
        .findById(user.id)
        .patch({
          lastLogin: new Date()
            .toISOString()
            .replace("T", " ")
            .replace("Z", "+00"),
        });
      console.log(
        `Dernière connexion mise à jour pour l'utilisateur ${user.username}`
      );

      // Génération du token JWT
      return module.exports.generateJwtToken(
        user,
        res,
        (message = "Connexion réussie !")
      );
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return res
        .status(500)
        .json({
          message: "Identifiants invalides",
          error: error.message,
        });
    }
  },

  generateJwtToken: async (user, res, message) => {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error(
          "JWT_SECRET n'est pas défini dans les variables d'environnement"
        );
      }
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          roleId: user.roleId,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h", algorithm: "HS256" }
      );
      console.log("user:", user);
      return res.status(200).json({
        message: message,
        token,
      });
    } catch (error) {
      console.error("Erreur lors de la génération du token JWT:", error);
      throw error;
    }
  },

  authenticate: async (req, res) => {
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

      // Vérifier que l'utilisateur existe encore
      const user = await User.query().findById(decoded.id);
      const adminRole = await Role.query().findOne({ name: "administrateur" });

      if (!user || (!user.completed && !(user.roleId === adminRole.id))) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      res.set("X-User-Id", decoded.id);
      res.set("X-Username", decoded.username);

      return res.status(200).json("Vous avez été vérifié avec succès.").end();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Token invalide" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expiré" });
      }
      console.error("Erreur lors de l'authentification:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },
};
