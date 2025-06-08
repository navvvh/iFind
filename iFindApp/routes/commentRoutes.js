const express = require("express")
const router = express.Router()
const { getCommentsByPost, createComment, deleteComment } = require("../controllers/commentController")

// GET /api/comments/post/:postId - Get comments for a post
router.get("/post/:postId", getCommentsByPost)

// POST /api/comments - Create new comment
router.post("/", createComment)

// DELETE /api/comments/:id - Delete comment
router.delete("/:id", deleteComment)

module.exports = router;
