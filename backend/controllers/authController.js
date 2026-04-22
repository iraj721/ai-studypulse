const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // include role
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save role as provided, default to 'student' if invalid
    const userRole = role && ['student', 'teacher', 'admin'].includes(role) ? role : 'student';

    user = await User.create({ name, email, password: hashedPassword, role: userRole });

    const token = generateToken(user._id);
    res.status(201).json({ token, role: userRole }); // return role for frontend routing
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({ token, role: user.role }); // return role for frontend routing
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = req.user; // from authMiddleware
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
