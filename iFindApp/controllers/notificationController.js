// This path is 100% correct based on your directory listing.
const { getConnection, sql } = require("../db");

// Get all notifications for a user
const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params
    const pool = await getConnection()
    const result = await pool.request().input("user_id", sql.Int, userId)
      .query(`
        SELECT
            notification_id,
            notification_text,
            is_read,
            date_created
        FROM notifications
        WHERE user_id = @user_id
        ORDER BY date_created DESC
    `)

    res.json({ success: true, data: result.recordset })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    })
  }
}

// Mark all of a user's notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params
    const pool = await getConnection()
    await pool.request().input("user_id", sql.Int, userId).query(`
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = @user_id AND is_read = 0
    `)

    res.json({ success: true, message: "All notifications marked as read." })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read",
      error: error.message,
    })
  }
}

module.exports = {
  getNotificationsByUser,
  markAllAsRead,
}