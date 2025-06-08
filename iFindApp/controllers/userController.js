const { getConnection, sql } = require('../db'); 
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT user_id, full_name, email, user_type, date_registered, avatar_id FROM users ORDER BY date_registered DESC');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
    }
};

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
            .query('INSERT INTO users (full_name, email, password, user_type) OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.user_type, INSERTED.completed_setup VALUES (@full_name, @email, @password, @user_type)');
        res.status(201).json({ success: true, message: "User created successfully", data: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating user", error: error.message });
    }
};

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
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request().input('user_id', sql.Int, id).query('SELECT user_id, full_name, email, user_type, date_registered, completed_setup, avatar_id FROM users WHERE user_id = @user_id');
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user", error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, user_type, completed_setup, avatar_id } = req.body;

    if (!full_name || !user_type || completed_setup === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }
    try {
        const pool = await getConnection();
        const request = pool.request()
            .input('user_id', sql.Int, id)
            .input('full_name', sql.VarChar, full_name)
            .input('user_type', sql.VarChar, user_type)
            .input('completed_setup', sql.Bit, completed_setup);

        let setClauses = "full_name = @full_name, user_type = @user_type, completed_setup = @completed_setup";
        if (avatar_id) {
            request.input('avatar_id', sql.Int, avatar_id);
            setClauses += ", avatar_id = @avatar_id";
        }
        
        const sqlQuery = `UPDATE users SET ${setClauses} OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.user_type, INSERTED.completed_setup, INSERTED.avatar_id WHERE user_id = @user_id`;
        const result = await request.query(sqlQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User not found to update" });
        }
        res.json({ success: true, message: "User updated successfully", data: result.recordset[0] });
    } catch (error) {
        console.error("Error updating user:", error); 
        res.status(500).json({ success: false, message: "Error updating user", error: error.message });
    }
};

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
        res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
    }
};

module.exports = { getAllUsers, createUser, loginUser, getUserById, updateUser, deleteUser };