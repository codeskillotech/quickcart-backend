import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All wishlist routes require token
router.use(requireAuth);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/item/:productId", removeFromWishlist);
router.delete("/clear", clearWishlist);

export default router;
