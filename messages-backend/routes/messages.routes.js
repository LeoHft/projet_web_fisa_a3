const messagesController = require("../controllers/messages.controller");

module.exports = function(app) {
  // Get all messages
  app.get("/api/messages", messagesController.getAllMessages);

  // Create a new message
  app.post("/api/messages", messagesController.createNewMessage);

  // Share a post via message
  app.post("/api/messages/share", messagesController.sharePost);
};
