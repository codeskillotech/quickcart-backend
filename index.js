import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
// Middleware
app.use(express.json());

// Database connection
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
// Sample Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
