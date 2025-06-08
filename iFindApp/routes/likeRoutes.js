const express = require("express");
const router = express.Router();
const { addLike, removeLike } = require("../controllers/likeController");

// POST /api/likes - Add like
router.post("/", addLike);

// DELETE /api/likes/post/:postId/user/:userId - Remove like
router.delete("/post/:postId/user/:userId", removeLike);

module.exports = router;