const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const signup = async (req, res) => {
  try {
    const { name, userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ userId: userId.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User ID already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: (name || "Anonymous").trim(),
      userId: userId.trim(),
      password: hashedPassword,
    });

    const token = createToken(user._id);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      if (error?.keyPattern?.userId) {
        return res.status(400).json({ message: "User ID already taken" });
      }

      return res.status(400).json({ message: "User data conflicts with existing records" });
    }

    console.error("Signup failed:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "User ID and password are required" });
    }

    const user = await User.findOne({ userId: userId.trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid user ID or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid user ID or password" });
    }

    const token = createToken(user._id);
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

const me = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = { signup, login, me };