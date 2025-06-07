const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Import routes (corrected paths)
const userRoutes = require("../routes/userRoutes");
const postRoutes = require("../routes/postRoutes");
const commentRoutes = require("../routes/commentRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const likeRoutes = require("../routes/likeRoutes");
const savedPostRoutes = require("../routes/savedRoutes");


// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "iFIND API is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/saved-posts", savedPostRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to iFIND API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      tester: "/test",
      users: "/api/users",
      posts: "/api/posts",
      comments: "/api/comments",
      notifications: "/api/notifications",
      likes: "/api/likes",
      savedPosts: "/api/saved-posts",
    },
  });
});

// Test page route
app.get("/test", (req, res) => {
  res.sendFile("C:\\Users\\Administrator\\Documents\\iFind\\iFind\\public\\test.html");
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    availableRoutes: [
      "GET /",
      "GET /api/health",
      "GET /test",
      "GET /api/users",
      "POST /api/users",
      "GET /api/posts",
      "POST /api/posts",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

module.exports = app;
