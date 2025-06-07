const express = require("express")
const router = express.Router()
const { getUserSavedPosts, savePost, removeSavedPost } = require("../controllers/savedPostController")

// GET /api/saved-posts/user/:userId - Get user's saved posts
router.get("/user/:userId", getUserSavedPosts)

// POST /api/saved-posts - Save a post
router.post("/", savePost)

// DELETE /api/saved-posts - Remove saved post
router.delete("/", removeSavedPost)

module.exports = router;
