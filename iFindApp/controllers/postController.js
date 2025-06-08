const { getConnection, sql } = require('../db');

const getAllPosts = async (req, res) => {
    try {
      const pool = await getConnection();
      
      // ✅ FIX: The ISNULL() function ensures that if the like count is NULL, it will be replaced with 0.
      const query = `
          SELECT 
              p.post_id, p.description, p.campus, p.post_type, 
              p.image_path, p.date_posted, p.date_last_edited,
              u.user_id as author_id, u.full_name as author_name,
              u.user_type as author_type, u.avatar_id as author_avatar_id,
              ISNULL((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id), 0) as like_count,
              CAST(CASE WHEN EXISTS (SELECT 1 FROM likes l2 WHERE l2.post_id = p.post_id AND l2.user_id = @current_user_id) THEN 1 ELSE 0 END AS BIT) as has_liked
          FROM posts p
          INNER JOIN users u ON p.user_id = u.user_id
          WHERE p.is_deleted = 0
          ORDER BY p.date_posted DESC
      `;
      
      const currentUserId = req.query.userId || 0;
  
      const result = await pool.request()
          .input('current_user_id', sql.Int, currentUserId)
          .query(query);
          
      res.json({ success: true, data: result.recordset });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ success: false, message: "Error fetching posts", error: error.message });
    }
  };

const updatePost = async (req, res) => {
    const { id } = req.params;
    const { description, campus, post_type } = req.body;
    try {
        const pool = await getConnection();
        const now = new Date(); 
        const query = `
            UPDATE posts 
            SET description = @description, campus = @campus, post_type = @post_type, date_last_edited = @dateLastEdited 
            OUTPUT INSERTED.* 
            WHERE post_id = @post_id
        `;
        const result = await pool.request()
            .input('post_id', sql.Int, id)
            .input('description', sql.Text, description)
            .input('campus', sql.VarChar, campus)
            .input('post_type', sql.VarChar, post_type)
            .input('dateLastEdited', sql.DateTime, now) 
            .query(query);
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        const query = `UPDATE posts SET is_deleted = 1 WHERE post_id = @post_id`;
        const result = await pool.request().input('post_id', sql.Int, id).query(query);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json({ success: true, message: 'Post marked as deleted successfully' });
    } catch (error) {
        console.error("Error soft-deleting post:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { user_id, description, campus, post_type, image_path } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
          .input("user_id", sql.Int, user_id)
          .input("description", sql.Text, description)
          .input("campus", sql.VarChar, campus)
          .input("post_type", sql.VarChar, post_type)
          .input("image_path", sql.VarChar, image_path || null)
          .query('INSERT INTO posts (user_id, description, campus, post_type, image_path) OUTPUT INSERTED.* VALUES (@user_id, @description, @campus, @post_type, @image_path)');
        res.status(201).json({ success: true, message: "Post created successfully", data: result.recordset[0] });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ success: false, message: "Error creating post", error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request().input("post_id", sql.Int, id).query(`
            SELECT p.*, u.full_name as author_name, u.user_type as author_type, u.avatar_id as author_avatar_id
            FROM posts p
            INNER JOIN users u ON p.user_id = u.user_id
            WHERE p.post_id = @post_id AND p.is_deleted = 0
        `);
        if (result.recordset.length === 0) {
          return res.status(404).json({ success: false, message: "Post not found" });
        }
        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ success: false, message: "Error fetching post", error: error.message });
    }
};

module.exports = { getAllPosts, createPost, getPostById, updatePost, deletePost };