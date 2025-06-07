const express = require("express")
const router = express.Router()
const { getAllUsers, createUser, getUserById, updateUser, deleteUser } = require("../controllers/userController");


// GET /api/users - Get all users
router.get("/", getAllUsers)

// POST /api/users - Create new user
router.post("/", createUser)

// GET /api/users/:id - Get user by ID
router.get("/:id", getUserById)

// PUT /api/users/:id - Update user
router.put("/:id", updateUser)

// DELETE /api/users/:id - Delete user
router.delete("/:id", deleteUser)

module.exports = router;
