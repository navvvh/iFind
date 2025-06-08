// --- FINAL CORRECTED commentController.js ---

const { getConnection, sql } = require('../db');

// Get all comments for a post
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input("post_id", sql.Int, postId)
      .query(`
        SELECT 
          c.comment_id, c.comment_text, c.date_posted,
          u.full_name as author_name, u.user_type as author_type
        FROM 
          comments c -- ✅ Corrected to 'comments'
        INNER JOIN 
          users u ON c.user_id = u.user_id
        WHERE c.post_id = @post_id
        ORDER BY c.date_posted ASC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: "Error fetching comments", error: error.message });
  }
};

// Create new comment
const createComment = async (req, res) => {
  try {
    const { post_id, user_id, comment_text } = req.body;
    const pool = await getConnection();
    const result = await pool.request()
      .input("post_id", sql.Int, post_id)
      .input("user_id", sql.Int, user_id)
      .input("comment_text", sql.Text, comment_text)
      .query(`
        INSERT INTO comments (post_id, user_id, comment_text) -- ✅ Corrected to 'comments'
        OUTPUT INSERTED.comment_id, INSERTED.comment_text, INSERTED.date_posted
        VALUES (@post_id, @user_id, @comment_text)
      `);
    res.status(201).json({ success: true, message: "Comment created successfully", data: result.recordset[0] });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ success: false, message: "Error creating comment", error: error.message });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input("comment_id", sql.Int, id)
      .query("DELETE FROM comments WHERE comment_id = @comment_id"); // ✅ Corrected to 'comments'
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Error deleting comment", error: error.message });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  deleteComment,
};