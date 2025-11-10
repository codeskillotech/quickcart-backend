import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    details: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String, default: "" }, // ✅ Image URL stored here
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
