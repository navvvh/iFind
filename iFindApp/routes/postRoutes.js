const express = require("express");
const router = express.Router();

// Import the entire controller object
const postController = require("../controllers/postController");

// Now we use the functions from the imported object.
// This is more robust and makes it clear where the functions come from.

// Route to get all posts
router.get("/", postController.getAllPosts);

// Route to create a new post
router.post("/", postController.createPost);

// Route to get a single post by its ID
router.get("/:id", postController.getPostById);

// Route to update a post by its ID
router.put("/:id", postController.updatePost);

// Route to delete a post by its ID
router.delete("/:id", postController.deletePost);

module.exports = router;