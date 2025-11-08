// routes/authRoutes.js
import { Router } from "express";
import { register, login, me, directResetPassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/reset-password-direct", directResetPassword);
export default router;
