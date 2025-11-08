// controllers/subscriptionController.js
import Subscription from "../models/Subscription.js";
import jwt from "jsonwebtoken";

const normalizeEmail = (email) =>
  (email || "").trim().replace(/\.$/, "").toLowerCase();

// Try to read bearer token (optional)
const getUserIdFromAuth = (req) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.sub || null;
  } catch {
    return null;
  }
};

// POST /api/subscriptions
export const subscribe = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: "Email is required." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email." });
    }

    const userId = getUserIdFromAuth(req);

    // Upsert: if already exists, set status=subscribed and attach userId if missing
    const sub = await Subscription.findOneAndUpdate(
      { email },
      { $set: { status: "subscribed" }, $setOnInsert: { userId } },
      { upsert: true, new: true }
    );

    // If it existed but had no userId, optionally attach it now
    if (!sub.userId && userId) {
      sub.userId = userId;
      await sub.save();
    }

    return res.status(200).json({
      message: "Subscribed successfully.",
      subscription: { email: sub.email, status: sub.status }
    });
  } catch (e) {
    // unique index race — retry as update
    if (e.code === 11000) {
      await Subscription.updateOne(
        { email: normalizeEmail(req.body.email) },
        { $set: { status: "subscribed" } }
      );
      return res.status(200).json({ message: "Subscribed successfully." });
    }
    console.error(e);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/subscriptions/unsubscribe
export const unsubscribe = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: "Email is required." });

    const sub = await Subscription.findOneAndUpdate(
      { email },
      { $set: { status: "unsubscribed" } },
      { new: true }
    );

    // Always respond 200 to avoid email enumeration
    return res.status(200).json({
      message: "You have been unsubscribed (if the email existed).",
      ...(sub ? { subscription: { email: sub.email, status: sub.status } } : {})
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error." });
  }
};

// GET /api/subscriptions/status?email=...
export const status = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);
    if (!email) return res.status(400).json({ message: "Email is required." });

    const sub = await Subscription.findOne({ email }).select("email status");
    if (!sub) return res.json({ email, status: "none" });

    return res.json(sub);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error." });
  }
};
