// --- START OF CORRECTED postRoutes.js ---

const express = require('express');
const router = express.Router();

// Import all necessary functions from the controller
const { 
    getAllPosts, 
    createPost, 
    getPostById,
    updatePost,  // Make sure this is imported
    deletePost   // Make sure this is imported
} = require('../controllers/postController');

// GET /api/posts - Get all posts
router.get('/', getAllPosts);

// POST /api/posts - Create a new post
router.post('/', createPost);

// GET /api/posts/:id - Get a single post by its ID
router.get('/:id', getPostById);

// ✅ ADDED THIS ROUTE: Handles updating a post
// PUT /api/posts/:id
router.put('/:id', updatePost);

// ✅ ADDED THIS ROUTE: Handles deleting a post
// DELETE /api/posts/:id
router.delete('/:id', deletePost);

module.exports = router;