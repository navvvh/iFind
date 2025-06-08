const { getConnection, sql } = require("../db")


// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT 
          notification_id,
          message,
          is_read,
          date_created
        FROM notifications
        WHERE user_id = @user_id
        ORDER BY date_created DESC
      `)

    res.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    })
  }
}

// Create new notification
const createNotification = async (req, res) => {
  try {
    const { user_id, message } = req.body

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .input("message", sql.Text, message)
      .query(`
        INSERT INTO notifications (user_id, message)
        OUTPUT INSERTED.notification_id, INSERTED.message, INSERTED.date_created
        VALUES (@user_id, @message)
      `)

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
    })
  }
}

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("notification_id", sql.Int, id)
      .query(`
        UPDATE notifications 
        SET is_read = 1
        WHERE notification_id = @notification_id
      `)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      })
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    res.status(500).json({
      success: false,
      message: "Error updating notification",
      error: error.message,
    })
  }
}

module.exports = {
  getUserNotifications,
  createNotification,
  markAsRead,
}
