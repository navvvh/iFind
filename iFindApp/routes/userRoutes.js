const express = require('express');
const bcrypt = require('bcrypt');
const { getConnection } = require('../db');

const router = express.Router();

// Signup route (Register new user)
router.post('/', async (req, res) => {
  const { full_name, email, password, user_type } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await getConnection();

    // Check if email already exists
    const exists = await pool.request()
      .input('email', email)
      .query('SELECT user_id FROM users WHERE email = @email');

    if (exists.recordset.length) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Insert new user
    const result = await pool.request()
      .input('full_name', full_name)
      .input('email', email)
      .input('password', hashedPassword)
      .input('user_type', user_type || 'Student')
      .query(`
        INSERT INTO users (full_name, email, password, user_type, date_registered)
        OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.user_type, INSERTED.date_registered
        VALUES (@full_name, @email, @password, @user_type, GETDATE())
      `);

    const newUser = result.recordset[0];
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Missing email or password' });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('email', email)
      .query('SELECT * FROM users WHERE email = @email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Successful login
    res.json({
      success: true,
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        user_type: user.user_type,
        date_registered: user.date_registered,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
