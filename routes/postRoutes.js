const express = require("express")
const router = express.Router()
const { getAllPosts, createPost, getPostById } = require("../controllers/postController")

// GET /api/posts - Get all posts (with optional filters)
router.get("/", getAllPosts)

// POST /api/posts - Create new post
router.post("/", createPost)

// GET /api/posts/:id - Get post by ID
router.get("/:id", getPostById)

module.exports = router;
