const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  const { name, email, password, role, class_name } = req.body;

  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user with hashed password
    const sql = "INSERT INTO users (name, email, password, role, class) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [name, email, hashedPassword, role, class_name]);

    res.status(201).json({ 
      message: "User created successfully", 
      userId: result.insertId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { name, email, role, class_name } = req.body;
  
  try {
    const sql = "UPDATE users SET name = ?, email = ?, role = ?, class = ? WHERE id = ?";
    await db.query(sql, [name, email, role, class_name, req.params.id]);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
