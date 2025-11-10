// routes/contactRoutes.js
import { Router } from "express";
import {
  createContactMessage,
  listContactMessages
} from "../controllers/contactController.js";

// If you want to protect admin routes with your JWT middleware:
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public endpoint: store a message
router.post("/", createContactMessage);

// Admin endpoints (require token)
router.get("/",  listContactMessages);


export default router;
