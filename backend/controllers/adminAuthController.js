const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* 🔐 Admin Login */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ⚠️ TEMP — Create Admin (1 time use) */
exports.createAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ role: "admin" });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Admin",
      email: "admin@studypulse.com",
      password: hashedPassword,
      role: "admin"
    });

    res.json({
      message: "Admin created",
      admin
    });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
