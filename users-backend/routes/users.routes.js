const followController = require("../controllers/follow.controller");
const userController = require("../controllers/user.controller");

// Routes protégées par le nginx
module.exports = function (app) {
  // Suivi (follow / unfollow)
  app.post("/api/users/follow/:userId", followController.followUser);
  app.delete("/api/users/unfollow/:userId", followController.unFollowUser);

  // Abonnés (followers)
  app.get("/api/users/followers", followController.getFollowers);
  app.get("/api/users/followers/:userId", followController.getFollowers);

  // Abonnements (followings)
  app.get("/api/users/following", followController.getFollowings);
  app.get("/api/users/following/:userId", followController.getFollowings);

  // Utilisateurs
  app.post("/api/users/getUsersByIds", userController.getUsersByIds);
  app.get("/api/users/getUser", userController.getUser); // utilisateur actuel connecté
  app.get("/api/users/getUser/:userId", userController.getUser); // utilisateur par ID
  app.get("/api/users/search", userController.searchUsers); // recherche classique
  app.get("/api/users/searchvalidate", userController.searchValidateUsers); // recherche utilisateurs à valider
  app.get("/api/users/searchban", userController.searchBanUsers); // recherche utilisateurs à bannir
  app.get("/api/users/getFriends", userController.getFriends); // amis (follow mutuel)

  // Actions administratives
  app.post("/api/users/validate", userController.validateUser); // validation utilisateur
  app.post("/api/users/ban", userController.banUser); // bannissement utilisateur
  app.post("/api/users/create", userController.createUser); // création d'utilisateur

  // Mise à jour
  app.post("/api/users/editBio", userController.editBio); // édition de la bio
};
