const postsController = require("../controllers/posts.controller");


// Routes protégées par le nginx
module.exports = function(app) {
    app.get("/api/posts/getUserPosts", postsController.getUserPosts);
    app.get("/api/posts/getUserPosts/:userId", postsController.getUserPosts);
    app.get("/api/posts/getUserComments", postsController.getUserComments);
    app.get("/api/posts/getUserComments/:userId", postsController.getUserComments);
    app.post("/api/posts/createPost", postsController.createPost);
    app.post("/api/posts/getFollowingPosts", postsController.getFollowingPosts);
    app.post("/api/posts/:postId/:parentId/CreateComment", postsController.createComment);
    app.get("/api/posts/:postId/:parentId/getComments", postsController.getPostComments);
    app.get("/api/posts/getPostById/:postId", postsController.getPostById);
    app.post("/api/posts/updatePost", postsController.updatePost);
    app.post("/api/posts/deletePost", postsController.deletePost);
    app.post('/api/posts/:postId/toggleLike', postsController.toggleLikePost);
};
