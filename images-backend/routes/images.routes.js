const imagesController = require("../controllers/images.controller");

module.exports = function(app) {
    app.get("/api/images/getUserPicture", imagesController.getUserPicture);
    app.get("/api/images/getUserPicture/:userId", imagesController.getUserPicture);
    app.post("/api/images/postUserPicture", imagesController.postUserPicture);
    app.post("/api/images/postUserPicture/:userId", imagesController.postUserPicture);
    app.post("/api/images/getUsersPictures", imagesController.getUsersPictures);
};