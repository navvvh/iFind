const { getConnection, sql } = require("../db")

// Get likes for a post
const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("post_id", sql.Int, postId)
      .query(`
        SELECT 
          l.like_id,
          l.date_liked,
          u.full_name as user_name
        FROM likes l
        INNER JOIN users u ON l.user_id = u.user_id
        WHERE l.post_id = @post_id
        ORDER BY l.date_liked DESC
      `)

    const countResult = await pool
      .request()
      .input("post_id", sql.Int, postId)
      .query("SELECT COUNT(*) as like_count FROM likes WHERE post_id = @post_id")

    res.json({
      success: true,
      data: {
        likes: result.recordset,
        total_likes: countResult.recordset[0].like_count,
      },
    })
  } catch (error) {
    console.error("Error fetching likes:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching likes",
      error: error.message,
    })
  }
}

// Add like to post
const addLike = async (req, res) => {
  try {
    const { post_id, user_id } = req.body

    // Check if user already liked this post
    const pool = await getConnection()
    const existingLike = await pool
      .request()
      .input("post_id", sql.Int, post_id)
      .input("user_id", sql.Int, user_id)
      .query("SELECT like_id FROM likes WHERE post_id = @post_id AND user_id = @user_id")

    if (existingLike.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already liked this post",
      })
    }

    const result = await pool
      .request()
      .input("post_id", sql.Int, post_id)
      .input("user_id", sql.Int, user_id)
      .query(`
        INSERT INTO likes (post_id, user_id)
        OUTPUT INSERTED.like_id, INSERTED.date_liked
        VALUES (@post_id, @user_id)
      `)

    res.status(201).json({
      success: true,
      message: "Like added successfully",
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error adding like:", error)
    res.status(500).json({
      success: false,
      message: "Error adding like",
      error: error.message,
    })
  }
}

// Remove like
const removeLike = async (req, res) => {
  try {
    const { post_id, user_id } = req.body

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("post_id", sql.Int, post_id)
      .input("user_id", sql.Int, user_id)
      .query("DELETE FROM likes WHERE post_id = @post_id AND user_id = @user_id")

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      })
    }

    res.json({
      success: true,
      message: "Like removed successfully",
    })
  } catch (error) {
    console.error("Error removing like:", error)
    res.status(500).json({
      success: false,
      message: "Error removing like",
      error: error.message,
    })
  }
}

module.exports = {
  getPostLikes,
  addLike,
  removeLike,
}
