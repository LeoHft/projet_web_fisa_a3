const authController = require('../controllers/auth.controller.js');
const requiredFields = require('../middlewares/requiredFields.middleware.js'); 

// Routes NON protégées par le nginx
module.exports = function(app) {
    app.post("/api/auth/register", authController.register);
    app.post("/api/auth/login", authController.login);
    app.get("/api/auth/authenticate", authController.authenticate);
};
