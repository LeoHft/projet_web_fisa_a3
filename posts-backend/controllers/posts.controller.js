const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Post = require("../models/posts.model");
const Comment = require("../models/comments.model");
const Like = require("../models/likes.model");

module.exports = {
  getUserPosts: async (req, res) => {
    try {
      let userId;

      if (!req.params.userId) {
        const authHeader = req.headers.authorization;
        const decoded = decodeTokenFromHeader(authHeader);
        userId = decoded.id;
      } else {
        userId = req.params.userId;
      }

      const posts = await Post.query()
        .where("userId", userId)
        .orderBy("createdAt", "desc");

      // Rendre l'heure lisible en FR
      posts.forEach((post) => {
        if (post.updatedAt) {
          post.updatedAt = new Date(post.updatedAt).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          });
        }
      });
      res
        .status(200)
        .json({
          message: "Posts de l'utilisateur récupérés avec succès",
          posts,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la récupération des posts",
          error: error.message,
        });
    }
  },

  getUserComments: async (req, res) => {
    try {
      let userId;

      if (!req.params.userId) {
        const authHeader = req.headers.authorization;
        const decoded = decodeTokenFromHeader(authHeader);
        userId = decoded.id;
      } else {
        userId = req.params.userId;
      }

      const comments = await Comment.query()
        .where("userId", userId)
        .orderBy("createdAt", "desc");
      // Rendre l'heure lisible en FR
      comments.forEach((comment) => {
        if (comment.updatedAt) {
          comment.updatedAt = new Date(comment.updatedAt).toLocaleString(
            "fr-FR",
            { timeZone: "Europe/Paris" }
          );
        }
      });

      res
        .status(200)
        .json({
          message: "Commentaires de l'utilisateur récupérés avec succès",
          comments,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la récupération des commentaires",
          error: error.message,
        });
    }
  },

  createPost: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const userId = decoded.id;
      const { content } = req.body;

      if (!content || content.length > 280) {
        return res.status(400).json({ message: "Contenu du post invalide" });
      }

      const newPost = await Post.query().insert({
        userId,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({ message: "Post créé avec succès", post: newPost });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la création du post",
          error: error.message,
        });
    }
  },

  getFollowingPosts: async (req, res) => {
    console.log("getFollowingPosts called");
    console.log("Request body:", req.body);

    try {
      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const userId = decoded.id;
      const usernameDecoded = decoded.username;

      // S'assurer que la liste existe, sinon on crée une liste vide
      let followingUsers = Array.isArray(req.body.followingUsersId)
        ? req.body.followingUsersId
        : [];

      // Ajouter l'utilisateur courant s'il n'est pas déjà dedans
      if (!followingUsers.some((user) => user.id === userId)) {
        followingUsers.push({ id: userId, username: usernameDecoded });
      }

      const userIdToUsername = {};
      let userIds = followingUsers.map((user) => {
        userIdToUsername[user.id] = user.username;
        return user.id;
      });

      const followingUsersPosts = await Post.query()
        .whereIn("userId", userIds)
        .orderBy("createdAt", "desc")
        .select("posts.*")
        .withGraphFetched("likes")
        .modifyGraph("likes", (builder) => {
          builder.where("userId", userId);
        });

      if (followingUsersPosts.length === 0) {
        return res.status(200).json({ message: "Aucun post à afficher" });
      }

      followingUsersPosts.forEach((post) => {
        post.username = userIdToUsername[post.userId] || "Inconnu";
        if (post.updatedAt) {
          post.updatedAt = new Date(post.updatedAt).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          });
        }
        post.isLikedByCurrentUser = post.likes.length > 0;
      });

      res.status(200).json({
        message: "Posts des utilisateurs suivis récupérés avec succès",
        followingUsersPosts,
      });
    } catch (error) {
      console.error("Erreur dans getFollowingPosts:", error);
      res.status(500).json({
        message:
          "Erreur lors de la récupération des posts des utilisateurs suivis",
        error: error.message,
      });
    }
  },
  getPostById: async (req, res) => {
    try {
      const postId = req.params.postId;
      const post = await Post.query().findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post non trouvé" });
      }
      // Rendre l'heure lisible en FR
      if (post.updatedAt) {
        post.updatedAt = new Date(post.updatedAt).toLocaleString("fr-FR", {
          timeZone: "Europe/Paris",
        });
      }
      res.status(200).json({ message: "Post récupéré avec succès", post });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la récupération du post",
          error: error.message,
        });
    }
  },

  createComment: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const userId = decoded.id;
      const postId = req.params.postId;
      const rawParentId = req.params.parentId;
      const parentId =
        rawParentId === undefined || rawParentId === "null"
          ? null
          : Number(rawParentId);

      console.log(
        "Creating comment for postId:",
        postId,
        "parentId:",
        parentId
      );
      const { content } = req.body;

      if (!content || content.length > 280) {
        return res
          .status(400)
          .json({ message: "Contenu du commentaire invalide" });
      }

      const newComment = await Comment.query().insert({
        userId,
        postId: Number(postId),
        parentId: parentId,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await Post.query()
        .findById(postId)
        .patch({
          commentCount: Post.raw("?? + 1", ["commentCount"]),
        });

      res
        .status(201)
        .json({ message: "Commentaire créé avec succès", comment: newComment });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la création du commentaire",
          error: error.message,
        });
    }
  },

  getPostComments: async (req, res) => {
    try {
      const postId = req.params.postId;
      const rawParentId = req.params.parentId;
      const parentId =
        rawParentId === undefined || rawParentId === "null"
          ? null
          : Number(rawParentId);

      const comments = await Comment.query()
        .where("postId", postId)
        .andWhere("parentId", parentId)
        .orderBy("createdAt", "asc");

      // Rendre l'heure lisible en FR
      comments.forEach((comment) => {
        if (comment.updatedAt) {
          comment.updatedAt = new Date(comment.updatedAt).toLocaleString(
            "fr-FR",
            { timeZone: "Europe/Paris" }
          );
        }
      });

      res
        .status(200)
        .json({ message: "Commentaires récupérés avec succès", comments });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la récupération des commentaires",
          error: error.message,
        });
    }
  },

  updatePost: async (req, res) => {
    try {
      const { postId, content } = req.body;
      const type = req.body.type;

      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const userId = decoded.id;

      switch (type) {
        case 1:
          const existingPost = await Post.query().findById(postId);
          if (!content || content.length > 280) {
            return res
              .status(400)
              .json({ message: "content du post invalide" });
          }

          if (!existingPost) {
            return res.status(404).json({ message: "Post non trouvé" });
          }

          if (existingPost.userId !== userId) {
            return res
              .status(403)
              .json({ message: "Non autorisé à modifier ce post" });
          }

          const updatedPost = await Post.query().patchAndFetchById(postId, {
            content,
            updatedAt: new Date().toISOString(),
          });
          res
            .status(200)
            .json({
              message: "Post mis à jour avec succès",
              post: updatedPost,
            });
          break;
        case 2:
        case 3:
          const existingComment = await Comment.query().findById(postId);
          if (!content || content.length > 280) {
            return res
              .status(400)
              .json({ message: "content du Commentaire invalide" });
          }

          if (!existingComment) {
            return res.status(404).json({ message: "Commentaire non trouvé" });
          }

          if (existingComment.userId !== userId) {
            return res
              .status(403)
              .json({ message: "Non autorisé à modifier ce commentaire" });
          }

          const updatedComment = await Comment.query().patchAndFetchById(
            postId,
            {
              content,
              updatedAt: new Date().toISOString(),
            }
          );
          res
            .status(200)
            .json({
              message: "Commentaire mis à jour avec succès",
              post: updatedComment,
            });
          break;

        default:
          break;
      }
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la mise à jour du post",
          error: error.message,
        });
    }
  },

  deletePost: async (req, res) => {
    try {
      const postId = req.body.postId;
      const type = req.body.type;
      console.log("Type: ");
      console.log(type);
      console.log(typeof type);
      const authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      const userId = decoded.id;

      
      switch (type) {
        case 1:
          const existingPost = await Post.query().findById(postId);
          if (!existingPost) {
            return res.status(404).json({ message: "Post non trouvé" });
          }

          if (existingPost.userId !== userId) {
            return res
              .status(403)
              .json({ message: "Non autorisé à supprimer ce post" });
          }
          await Post.query().deleteById(postId);
          res.status(200).json({ message: "Post supprimé avec succès" });
          break;
        case 2:
        case 3:
          const existingComment = await Comment.query().findById(postId);
          if (!existingComment) {
            return res.status(404).json({ message: "Commentaire non trouvé" });
          }

          if (existingComment.userId !== userId) {
            return res
              .status(403)
              .json({ message: "Non autorisé à supprimer ce commentaire" });
          }
          await Comment.query().deleteById(postId);
          const postParentId = existingComment.postId;
          await Post.query()
            .findById(postParentId)
            .patch({
              commentCount: Post.raw("?? - 1", ["commentCount"]),
            });
          res.status(200).json({ message: "Commentaire supprimé avec succès" });
          break;
        default:
          res.status(400).json({ message: "Type invalide" });
          break;
      }
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la suppression du post",
          error: error.message,
        });
    }
  },

  toggleLikePost: async (req, res) => {
    try {
      const postId = parseInt(req.params.postId, 10);
      authHeader = req.headers.authorization;
      const decoded = decodeTokenFromHeader(authHeader);
      userId = decoded.id;
      console.log(postId, userId);

      const existing = await Like.query().findOne({ userId, postId });
      if (existing) {
        await Like.query().delete().where({ userId, postId });
        await Post.query()
          .findById(postId)
          .patch({
            likeCount: Post.raw('"likeCount" - 1'),
          });
        return res.status(200).json({ message: "Like supprimé" });
      } else {
        await Like.query().insert({ userId, postId });
        await Post.query()
          .findById(postId)
          .patch({
            likeCount: Post.raw('"likeCount" + 1'),
          });
        return res.status(201).json({ message: "Post liké" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erreur like", error: error.message });
    }
  },
};
const decodeTokenFromHeader = (authHeader) => {
  console.log(authHeader);
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
