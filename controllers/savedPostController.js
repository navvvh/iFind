const { getConnection, sql } = require("../iFindApp/db")

// Get saved posts for a user
const getUserSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT 
          sp.save_id,
          sp.date_saved,
          p.post_id,
          p.title,
          p.description,
          p.campus,
          p.post_type,
          p.image_path,
          p.date_posted,
          u.full_name as author_name
        FROM saved_posts sp
        INNER JOIN posts p ON sp.post_id = p.post_id
        INNER JOIN users u ON p.user_id = u.user_id
        WHERE sp.user_id = @user_id
        ORDER BY sp.date_saved DESC
      `)

    res.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error("Error fetching saved posts:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching saved posts",
      error: error.message,
    })
  }
}

// Save a post
const savePost = async (req, res) => {
  try {
    const { post_id, user_id } = req.body

    // Check if post is already saved
    const pool = await getConnection()
    const existingSave = await pool
      .request()
      .input("post_id", sql.Int, post_id)
      .input("user_id", sql.Int, user_id)
      .query("SELECT save_id FROM saved_posts WHERE post_id = @post_id AND user_id = @user_id")

    if (existingSave.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Post already saved",
      })
    }

    const result = await pool
      .request()
      .input("post_id", sql.Int, post_id)
      .input("user_id", sql.Int, user_id)
      .query(`
        INSERT INTO saved_posts (post_id, user_id)
        OUTPUT INSERTED.save_id, INSERTED.date_saved
        VALUES (@post_id, @user_id)
      `)

    res.status(201).json({
      success: true,
      message: "Post saved successfully",
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error saving post:", error)
    res.status(500).json({
      success: false,
      message: "Error saving post",
      error: error.message,
    })
  }
}

// Remove saved post
const removeSavedPost = async (req, res) => {
  try {
    const { post_id, user_id } = req.body

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("post_id", sql.Int, post_id)
      .input("user_id", sql.Int, user_id)
      .query("DELETE FROM saved_posts WHERE post_id = @post_id AND user_id = @user_id")

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Saved post not found",
      })
    }

    res.json({
      success: true,
      message: "Saved post removed successfully",
    })
  } catch (error) {
    console.error("Error removing saved post:", error)
    res.status(500).json({
      success: false,
      message: "Error removing saved post",
      error: error.message,
    })
  }
}

module.exports = {
  getUserSavedPosts,
  savePost,
  removeSavedPost,
}
