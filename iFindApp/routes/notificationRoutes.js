const express = require("express")
const router = express.Router()
const {
  getNotificationsByUser,
  markAllAsRead,
} = require("../controllers/notificationController")

// Get all notifications for a specific user
router.get("/user/:userId", getNotificationsByUser)

// Mark all notifications for a user as read
router.put("/user/:userId/mark-read", markAllAsRead)

module.exports = router