import mongoose from "mongoose";
import Product from "../models/Product.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createProduct = async (req, res) => {
  try {
    const { name, details, price, rating, image } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "name is required" });
    if (!details?.trim()) return res.status(400).json({ message: "details is required" });

    const p = Number(price);
    if (isNaN(p) || p <= 0) return res.status(400).json({ message: "price must be positive" });

    const r = rating ? Number(rating) : 0;
    if (isNaN(r) || r < 0 || r > 5) return res.status(400).json({ message: "rating must be between 0–5" });

    const product = await Product.create({
      name,
      details,
      price: p,
      rating: r,
      image: image || "",   // ✅ Save image URL directly (given by frontend)
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const listProducts = async (_req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    return res.json({ items });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid product id" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ product });
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/products/:id  (full update)
// Accepts: { name, details, price, rating, image }
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid product id" });

    const { name, details, price, rating, image } = req.body;

    // basic validations (only when fields are provided)
    if (name !== undefined && !String(name).trim())
      return res.status(400).json({ message: "name cannot be empty" });
    if (details !== undefined && !String(details).trim())
      return res.status(400).json({ message: "details cannot be empty" });
    if (price !== undefined) {
      const p = Number(price);
      if (Number.isNaN(p) || p <= 0) return res.status(400).json({ message: "price must be positive" });
    }
    if (rating !== undefined) {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 0 || r > 5) return res.status(400).json({ message: "rating must be between 0–5" });
    }

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (details !== undefined) updates.details = String(details).trim();
    if (price !== undefined) updates.price = Number(price);
    if (rating !== undefined) updates.rating = Number(rating);
    if (image !== undefined) updates.image = String(image).trim();

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,            // return updated doc
      runValidators: true,  // enforce schema validators
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ message: "Product updated", product });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid product id" });

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};