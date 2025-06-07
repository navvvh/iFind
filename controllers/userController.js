const { getConnection, sql } = require("../iFindApp/db")

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const pool = await getConnection()
    const result = await pool.request().query(`
                SELECT user_id, full_name, email, user_type, date_registered 
                FROM users 
                ORDER BY date_registered DESC
            `)

    res.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    })
  }
}

// Create new user
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, user_type = "Student" } = req.body

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("full_name", sql.VarChar(100), full_name)
      .input("email", sql.VarChar(100), email)
      .input("password", sql.VarChar(255), password)
      .input("user_type", sql.VarChar(50), user_type)
      .query(`
                INSERT INTO users (full_name, email, password, user_type)
                OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.user_type, INSERTED.date_registered
                VALUES (@full_name, @email, @password, @user_type)
            `)

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error creating user:", error)

    // Handle unique constraint violation (duplicate email)
    if (error.number === 2627) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      })
    }

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    })
  }
}

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, id)
      .query(`
                SELECT user_id, full_name, email, user_type, date_registered 
                FROM users 
                WHERE user_id = @user_id
            `)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    })
  }
}

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { full_name, email, user_type } = req.body

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, id)
      .input("full_name", sql.VarChar(100), full_name)
      .input("email", sql.VarChar(100), email)
      .input("user_type", sql.VarChar(50), user_type)
      .query(`
        UPDATE users 
        SET full_name = @full_name, email = @email, user_type = @user_type
        OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.user_type, INSERTED.date_registered
        WHERE user_id = @user_id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: result.recordset[0],
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    })
  }
}

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("user_id", sql.Int, id)
      .query("DELETE FROM users WHERE user_id = @user_id")

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    })
  }
}

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
}
