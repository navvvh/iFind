const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    createUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

// --- Route Order is Critical Here ---

// 1. Specific routes first
router.get("/", getAllUsers);
router.post("/login", loginUser);

// 2. Wildcard routes (with :id) last
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// This is an alias for the main create user route, often used for registration
router.post("/", createUser);


module.exports = router;