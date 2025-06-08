const { getConnection, sql } = require('../db');

// Add a like to a post
const addLike = async (req, res) => {
    const { post_id, user_id } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('post_id', sql.Int, post_id)
            .input('user_id', sql.Int, user_id)
            .query('INSERT INTO likes (post_id, user_id) VALUES (@post_id, @user_id)');
        res.status(201).json({ success: true, message: 'Post liked' });
    } catch (error) {
        // If the error is a unique constraint violation, it's not a server error
        if (error.number === 2627) {
            return res.status(409).json({ success: false, error: 'Post already liked by this user' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Remove a like from a post
const removeLike = async (req, res) => {
    const { postId, userId } = req.params; // Get from URL parameters
    try {
        const pool = await getConnection();
        await pool.request()
            .input('post_id', sql.Int, postId)
            .input('user_id', sql.Int, userId)
            .query('DELETE FROM likes WHERE post_id = @post_id AND user_id = @user_id');
        res.json({ success: true, message: 'Like removed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { addLike, removeLike };