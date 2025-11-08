// models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    }
  },
  { timestamps: true }
);

subscriptionSchema.index({ email: 1 }, { unique: true }); // one row per email

export default mongoose.model("Subscription", subscriptionSchema);
