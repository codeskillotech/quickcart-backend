// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const signToken = (user) => {
  return jwt.sign(
    { sub: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Normalize email but DO NOT block UI typing; we validate on submit.
const normalizeEmail = (email) => (email || "").trim().replace(/\.$/, "").toLowerCase();

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation (server-side)
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const cleanEmail = normalizeEmail(email);

    // RFC-light email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Please provide a valid email." });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: cleanEmail, passwordHash });

    const token = signToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    // Duplicate key safety
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered." });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    const token = signToken(user);

    return res.json({
      message: "Login successful.",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("_id name email");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};


export const directResetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Email, new password and confirm password are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });

    // To avoid leaking which emails exist, you can still return 200 with a generic message.
    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, the password has been reset." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password reset successful. You can now log in." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error." });
  }
};
