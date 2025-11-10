// controllers/contactController.js
import ContactMessage from "../models/ContactMessage.js";

// POST /api/contact  -> store a contact message
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name?.trim())   return res.status(400).json({ message: "Name is required" });
    if (!email?.trim())  return res.status(400).json({ message: "Email is required" });
    if (!message?.trim())return res.status(400).json({ message: "Message is required" });

    const doc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Message stored successfully",
      contact: {
        id: doc._id,
        name: doc.name,
        email: doc.email,
        message: doc.message,
        status: doc.status,
        createdAt: doc.createdAt
      }
    });
  } catch (err) {
    console.error("createContactMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// (Optional) Admin: list messages
export const listContactMessages = async (_req, res) => {
  try {
    const items = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .select("name email message status createdAt");
    return res.json({ items });
  } catch (err) {
    console.error("listContactMessages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
