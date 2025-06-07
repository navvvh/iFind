const { getConnection, sql } = require("../iFindApp/db")

// Get all posts with user information
const getAllPosts = async (req, res) => {
  try {
    const { campus, post_type } = req.query

    const pool = await getConnection()
    let query = `
            SELECT 
                p.post_id,
                p.title,
                p.description,
                p.campus,
                p.post_type,
                p.image_path,
                p.date_posted,
                u.full_name as author_name,
                u.user_type as author_type
            FROM posts p
            INNER JOIN users u ON p.user_id = u.user_id
            WHERE 1=1
        `

    const request = pool.request()

    if (campus) {
      query += " AND p.campus = @campus"
      request.input("campus", sql.VarChar(50), campus)
    }

    if (post_type) {
      query += " AND p.post_type = @post_type"
      request.input("post_type", sql.VarChar(10), post_type)
    }

    query += " ORDER BY p.date_posted DESC"

    const result = await request.query(query)

    res.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message,
    })
  }
}

// Create new post
const createPost = async (req, res) => {
  try {
    const { user_id, title, description, campus, post_type, image_path } = req.body

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .input("title", sql.VarChar(100), title)
      .input("description", sql.Text, description)
      .input("campus", sql.VarChar(50), campus)
      .input("post_type", sql.VarChar(10), post_type)
      .input("image_path", sql.VarChar(255), image_path)
      .query(`
                INSERT INTO posts (user_id, title, description, campus, post_type, image_path)
                OUTPUT INSERTED.post_id, INSERTED.title, INSERTED.campus, INSERTED.post_type, INSERTED.date_posted
                VALUES (@user_id, @title, @description, @campus, @post_type, @image_path)
            `)

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    })
  }
}

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("post_id", sql.Int, id)
      .query(`
        SELECT 
          p.post_id,
          p.title,
          p.description,
          p.campus,
          p.post_type,
          p.image_path,
          p.date_posted,
          u.full_name as author_name,
          u.user_type as author_type,
          u.user_id as author_id
        FROM posts p
        INNER JOIN users u ON p.user_id = u.user_id
        WHERE p.post_id = @post_id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    res.json({
      success: true,
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    })
  }
}

module.exports = {
  getAllPosts,
  createPost,
  getPostById,
}
