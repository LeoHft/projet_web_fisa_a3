const Message = require("../models/messages.model");
const jwt = require("jsonwebtoken");

module.exports = {
  // GET /messages
  getAllMessages: async (req, res) => {
    try {
      console.log("Fetching all messages...");
      const { id } = req.query;
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

      console.log("User ID from token:", userId);
      console.log("Fetching messages for user ID:", id);

      // Fetch messages between two users
      const messages = await Message.query()
        .skipUndefined()
        .where((builder) => {
          builder
            .where("senderId", userId)
            .andWhere("receiverId", id)
            .orWhere("senderId", id)
            .andWhere("receiverId", userId);
        })
        .orderBy("createdAt", "asc");
      res.status(200).json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  // POST /messages
  createNewMessage: async (req, res) => {
    try {
      const { receiverId, text, isSharing, sharedId } = req.body;

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
      const senderId = decoded.id;
      console.log("Sender ID from token:", senderId);
      console.log("Receiver ID:", receiverId);
      console.log("Message text:", text);
      console.log("Is sharing:", isSharing);
      console.log("Shared ID:", sharedId);

      if (!senderId || !receiverId || !text || typeof isSharing !== "boolean") {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newMessage = await Message.query().insert({
        senderId,
        receiverId: parseInt(receiverId, 10),
        text,
        isSharing,
        sharedId: sharedId ?? null,
        createdAt: new Date().toISOString(),
      });

      res
        .status(201)
        .json({ message: "Message created successfully", newMessage });
    } catch (error) {
      console.error("Error creating message:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  // POST /messages/share
  sharePost: async (req, res) => {
    try {
      const { postId, receiverId, message } = req.body;

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
      const senderId = decoded.id;

      if (!postId || !receiverId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newMessage = await Message.query().insert({
        senderId,
        receiverId: parseInt(receiverId, 10),
        text: message || '',
        isSharing: true,
        sharedId: postId,
        createdAt: new Date().toISOString(),
      });

      console.log("New message created:", newMessage);

      res.status(201).json({ message: "Post shared successfully", newMessage });
    } catch (error) {
      console.error("Error sharing post:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
};
