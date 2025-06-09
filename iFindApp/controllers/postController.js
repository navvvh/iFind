const { getConnection, sql } = require("../db");

// Get all posts, including like counts and user's like status
const getAllPosts = async (req, res) => {
  try {
    const { campus, post_type, userId, authorId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch posts.",
      });
    }

    const pool = await getConnection();
    
    let query = `
      SELECT 
        p.post_id,
        p.description,
        p.campus,
        p.post_type,
        p.image_path,
        p.date_posted,
        p.date_last_edited,
        u.full_name AS author_name,
        u.user_type AS author_type,
        u.avatar_id AS author_avatar_id,
        ISNULL(l.like_count, 0) AS like_count,
        CASE WHEN ul.user_id IS NOT NULL THEN 1 ELSE 0 END AS has_liked
      FROM 
        posts p
      INNER JOIN 
        users u ON p.user_id = u.user_id
      LEFT JOIN 
        (SELECT post_id, COUNT(*) AS like_count FROM likes GROUP BY post_id) l ON p.post_id = l.post_id
      LEFT JOIN 
        likes ul ON p.post_id = ul.post_id AND ul.user_id = @current_user_id
      WHERE 1=1
    `;

    const request = pool.request();
    
    request.input("current_user_id", sql.Int, userId);

    if (campus) {
      query += " AND p.campus = @campus";
      request.input("campus", sql.VarChar(50), campus);
    }
    
    if (authorId) {
        query += " AND p.user_id = @authorId";
        request.input("authorId", sql.Int, authorId);
    }

    if (post_type) {
      query += " AND p.post_type = @post_type";
      request.input("post_type", sql.VarChar(10), post_type);
    } else {
      query += " AND p.post_type IN ('lost', 'found')";
    }

    query += " ORDER BY p.date_posted DESC";

    const result = await request.query(query);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Error fetching posts", error: error.message });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const { user_id, description, campus, post_type, image_path } = req.body;
    if (!user_id || !description || !campus || !post_type) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    const pool = await getConnection();
    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .input("description", sql.Text, description)
      .input("campus", sql.VarChar(50), campus)
      .input("post_type", sql.VarChar(10), post_type)
      .input("image_path", sql.VarChar(255), image_path || null)
      .query(`
        INSERT INTO posts (user_id, description, campus, post_type, image_path)
        OUTPUT INSERTED.post_id, INSERTED.description, INSERTED.campus, INSERTED.post_type, INSERTED.date_posted
        VALUES (@user_id, @description, @campus, @post_type, @image_path)
      `);
    res.status(201).json({ success: true, message: "Post created successfully", data: result.recordset[0] });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, message: "Error creating post", error: error.message });
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input("post_id", sql.Int, id)
      // THIS IS THE CORRECTED AND CLEANED QUERY
      .query(`
        SELECT 
          p.*, 
          u.full_name as author_name, 
          u.user_type as author_type, 
          u.user_id as author_id
        FROM posts p 
        INNER JOIN users u ON p.user_id = u.user_id 
        WHERE p.post_id = @post_id
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

// Update a post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, campus, post_type } = req.body;
    
    const pool = await getConnection();
    await pool.request()
      .input("post_id", sql.Int, id)
      .input("description", sql.Text, description)
      .input("campus", sql.VarChar(50), campus)
      .input("post_type", sql.VarChar(10), post_type)
      .query(`
        UPDATE posts 
        SET description = @description, campus = @campus, post_type = @post_type, date_last_edited = GETDATE()
        WHERE post_id = @post_id
      `);
    
    res.json({ success: true, message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ success: false, message: "Error updating post", error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        await pool.request()
            .input("post_id", sql.Int, id)
            .query('DELETE FROM posts WHERE post_id = @post_id');
        
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Error deleting post', error: error.message });
    }
};

module.exports = {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
};