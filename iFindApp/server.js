const express = require("express")
const path = require("path")
const { testConnection } = require("./db")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  if (req.method === "OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Test route - OUTSIDE the database connection
app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html")) // This looks in root folder
})

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "iFIND API is running successfully",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// Sample data
const users = [
  { id: 1, full_name: "John Doe", email: "john@example.com", user_type: "Student", username: "johndoe" },
  { id: 2, full_name: "Jane Smith", email: "jane@example.com", user_type: "Staff", username: "janesmith" },
]

const posts = [
  {
    id: 1,
    title: "Lost Item: Blue Backpack",
    description: "Lost in the library",
    user_id: 1,
    campus: "Main Building",
    post_type: "Lost",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Found: Car Keys",
    description: "Found in the parking lot",
    user_id: 2,
    campus: "Engineering Building",
    post_type: "Found",
    created_at: new Date().toISOString(),
  },
]

const comments = [
  { id: 1, comment_text: "I think I saw it!", post_id: 1, user_id: 2, created_at: new Date().toISOString() },
  { id: 2, comment_text: "Are they Toyota keys?", post_id: 2, user_id: 1, created_at: new Date().toISOString() },
]

// User routes
app.get("/api/users", (req, res) => {
  res.json({
    success: true,
    data: users,
    count: users.length,
  })
})

app.post("/api/users", (req, res) => {
  console.log("Creating user with data:", req.body)

  const { full_name, email, password, user_type } = req.body

  if (!full_name || !email || !password || !user_type) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: full_name, email, password, user_type",
    })
  }

  const existingUser = users.find((user) => user.email === email)
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: "Email already exists",
    })
  }

  const username = full_name.toLowerCase().replace(/\s+/g, "") + (users.length + 1)

  const newUser = {
    id: users.length + 1,
    full_name,
    email,
    user_type,
    username,
    completed_setup: false,
    created_at: new Date().toISOString(),
  }

  users.push(newUser)

  res.status(201).json({
    success: true,
    data: newUser,
    message: "User created successfully",
  })
})

// Post routes
app.get("/api/posts", (req, res) => {
  let filteredPosts = posts

  // Filter by campus if provided
  if (req.query.campus) {
    filteredPosts = filteredPosts.filter((post) => post.campus.toLowerCase().includes(req.query.campus.toLowerCase()))
  }

  // Filter by post type if provided
  if (req.query.post_type) {
    filteredPosts = filteredPosts.filter((post) => post.post_type.toLowerCase() === req.query.post_type.toLowerCase())
  }

  res.json({
    success: true,
    data: filteredPosts,
    count: filteredPosts.length,
  })
})

app.post("/api/posts", (req, res) => {
  const { user_id, title, description, campus, post_type, image_path } = req.body

  if (!user_id || !title || !description || !campus || !post_type) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: user_id, title, description, campus, post_type",
    })
  }

  const newPost = {
    id: posts.length + 1,
    user_id: Number.parseInt(user_id),
    title,
    description,
    campus,
    post_type,
    image_path: image_path || null,
    created_at: new Date().toISOString(),
  }

  posts.push(newPost)

  res.status(201).json({
    success: true,
    data: newPost,
    message: "Post created successfully",
  })
})

// Comment routes
app.get("/api/comments/post/:postId", (req, res) => {
  const postId = Number.parseInt(req.params.postId)
  const postComments = comments.filter((comment) => comment.post_id === postId)

  // Add user information to comments
  const commentsWithUsers = postComments.map((comment) => {
    const user = users.find((u) => u.id === comment.user_id)
    return {
      ...comment,
      user_name: user ? user.full_name : "Unknown User",
    }
  })

  res.json({
    success: true,
    data: commentsWithUsers,
    count: commentsWithUsers.length,
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  })
})

// Start server and test database connection
testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
      console.log(`📋 API Tester available at http://localhost:${PORT}/test`)
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
    })
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  })
