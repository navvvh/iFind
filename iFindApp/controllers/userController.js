// --- PASTE THIS ENTIRE BLOCK INTO the new userController.js FILE ---

// Path to the database file. Assumes db.js is in the iFindApp folder.
const { getConnection, sql } = require('../db'); 
const bcrypt = require('bcrypt');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT user_id, full_name, email, user_type, date_registered 
            FROM users 
            ORDER BY date_registered DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
    }
};

// Create new user (Signup)
const createUser = async (req, res) => {
    const { full_name, email, password, user_type = "Student" } = req.body;
    if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await getConnection();

        const exists = await pool.request().input('email', sql.VarChar, email).query('SELECT user_id FROM users WHERE email = @email');
        if (exists.recordset.length > 0) {
            return res.status(409).json({ success: false, error: 'Email already exists' });
        }

        const result = await pool.request()
            .input('full_name', sql.VarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('user_type', sql.VarChar, user_type)
            .query(`
                INSERT INTO users (full_name, email, password, user_type)
                OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.user_type, INSERTED.completed_setup
                VALUES (@full_name, @email, @password, @user_type)
            `);
        
        res.status(201).json({ success: true, message: "User created successfully", data: result.recordset[0] });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ success: false, message: "Error creating user", error: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Missing email or password' });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request().input('email', sql.VarChar, email).query('SELECT * FROM users WHERE email = @email');
        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request().input('user_id', sql.Int, id).query(`
            SELECT user_id, full_name, email, user_type, date_registered, completed_setup 
            FROM users 
            WHERE user_id = @user_id
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, message: "Error fetching user", error: error.message });
    }
};

// Update user - This is the function for the setup page
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, user_type, completed_setup } = req.body;

    if (!full_name || !user_type || completed_setup === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields: full_name, user_type, and completed_setup are required.' });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('user_id', sql.Int, id)
            .input('full_name', sql.VarChar, full_name)
            .input('user_type', sql.VarChar, user_type)
            .input('completed_setup', sql.Bit, completed_setup)
            .query(`
                UPDATE users 
                SET full_name = @full_name, user_type = @user_type, completed_setup = @completed_setup
                OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.user_type, INSERTED.completed_setup
                WHERE user_id = @user_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User not found to update" });
        }
        
        res.json({ success: true, message: "User updated successfully", data: result.recordset[0] });
    } catch (error) {
        console.error("Error updating user:", error); 
        res.status(500).json({ success: false, message: "Error updating user", error: error.message });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request().input('user_id', sql.Int, id).query("DELETE FROM users WHERE user_id = @user_id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
    }
};


module.exports = {
    getAllUsers,
    createUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser,
};