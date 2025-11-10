// models/ContactMessage.js
import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true, maxlength: 120 },
    email:  { type: String, required: true, trim: true, maxlength: 200 },
    message:{ type: String, required: true, trim: true, maxlength: 5000 },
    // optional fields for admin workflow
    status: { type: String, enum: ["new", "seen", "resolved"], default: "new" }
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", ContactMessageSchema);
