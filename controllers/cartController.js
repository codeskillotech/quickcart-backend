// controllers/cartController.js
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const oid = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId })
      .populate("items.product", "name price image rating details")
      .lean();

    return res.json({ items: cart?.items || [] });
  } catch (err) {
    console.error("getCart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/cart  { productId, qty? }
export const addToCart = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    if (!oid(productId)) return res.status(400).json({ message: "Invalid productId" });

    const prod = await Product.findById(productId).lean();
    if (!prod) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) cart = await Cart.create({ user: req.userId, items: [] });

    const idx = cart.items.findIndex((it) => String(it.product) === productId);
    if (idx >= 0) {
      cart.items[idx].qty += Number(qty) || 1;
    } else {
      cart.items.push({ product: productId, qty: Number(qty) || 1 });
    }

    await cart.save();
    return res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/cart/item/:productId  { qty }
export const updateCartQty = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty } = req.body;
    if (!oid(productId)) return res.status(400).json({ message: "Invalid productId" });

    const q = Number(qty);
    if (!Number.isInteger(q) || q < 1) return res.status(400).json({ message: "qty must be >= 1" });

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((it) => String(it.product) === productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.qty = q;
    await cart.save();
    return res.json({ message: "Quantity updated" });
  } catch (err) {
    console.error("updateCartQty error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/cart/item/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!oid(productId)) return res.status(400).json({ message: "Invalid productId" });

    await Cart.findOneAndUpdate(
      { user: req.userId },
      { $pull: { items: { product: productId } } }
    );

    return res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error("removeFromCart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.userId }, { items: [] }, { upsert: true });
    return res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("clearCart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
