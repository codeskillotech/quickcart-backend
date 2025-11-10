import mongoose from "mongoose";
import Wishlist from "../models/wishlist.js";
import Product from "../models/Product.js";

const oid = (id) => mongoose.Types.ObjectId.isValid(id);

// GET wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from token

    const wl = await Wishlist.findOne({ user: userId })
      .populate("items.product", "name details price image rating")
      .lean();

    return res.json({ items: wl?.items || [] });
  } catch (err) {
    console.error("getWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ADD to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from token
    const { productId } = req.body;

    if (!oid(productId)) return res.status(400).json({ message: "Invalid productId" });

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ message: "Product not found" });

    let wl = await Wishlist.findOne({ user: userId });
    if (!wl) wl = await Wishlist.create({ user: userId, items: [] });

    const isAlready = wl.items.some((i) => String(i.product) === productId);
    if (!isAlready) wl.items.push({ product: productId });

    await wl.save();
    return res.json({ message: "Added to wishlist" });
  } catch (err) {
    console.error("addToWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// REMOVE single wishlist item
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from token
    const { productId } = req.params;

    if (!oid(productId)) return res.status(400).json({ message: "Invalid productId" });

    await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } }
    );

    return res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// CLEAR wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from token

    await Wishlist.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });

    return res.json({ message: "Wishlist cleared" });
  } catch (err) {
    console.error("clearWishlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
