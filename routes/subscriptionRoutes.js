// routes/subscriptionRoutes.js
import { Router } from "express";
import { subscribe, unsubscribe, status } from "../controllers/subscriptionController.js";

const router = Router();

router.post("/", subscribe);               // subscribe
router.post("/unsubscribe", unsubscribe);   // unsubscribe
router.get("/status", status);              // check status (optional)

export default router;
