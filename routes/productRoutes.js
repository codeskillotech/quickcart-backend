import { Router } from "express";
import { createProduct, deleteProduct, getProductById, listProducts, updateProduct } from "../controllers/productController.js";

const router = Router();

router.post("/", createProduct);   // ✅ Add product
router.get("/", listProducts);     // ✅ Get all products
router.get("/:id", getProductById);     // get by id
router.put("/:id", updateProduct);      // update (full or partial as written)
router.delete("/:id", deleteProduct);
export default router;
