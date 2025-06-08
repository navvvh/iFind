const express = require('express');
const router = express.Router();
const { getAllPosts, createPost, getPostById } = require('../controllers/postController');

router.get('/', getAllPosts);          // GET /posts
router.post('/', createPost);          // POST /posts
router.get('/:id', getPostById);       // GET /posts/:id

module.exports = router;
