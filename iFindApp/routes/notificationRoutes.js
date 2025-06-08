const express = require("express")
const router = express.Router()
const { getUserNotifications, createNotification, markAsRead } = require("../controllers/notificationController")

// GET /api/notifications/user/:userId - Get user notifications
router.get("/user/:userId", getUserNotifications)

// POST /api/notifications - Create new notification
router.post("/", createNotification)

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", markAsRead)

module.exports = router;
