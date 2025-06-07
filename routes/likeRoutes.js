const express = require("express")
const router = express.Router()
const { getPostLikes, addLike, removeLike } = require("../controllers/likeController")

// GET /api/likes/post/:postId - Get likes for a post
router.get("/post/:postId", getPostLikes)

// POST /api/likes - Add like
router.post("/", addLike)

// DELETE /api/likes - Remove like
router.delete("/", removeLike)

module.exports = router;
