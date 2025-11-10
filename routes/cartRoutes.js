// routes/cartRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/item/:productId", updateCartQty);
router.delete("/item/:productId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
