import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/public", (req, res) => {
  res.json({ message: "This is a public endpoint" });
});

// Protected route
router.get("/private", protect, (req, res) => {
  res.json({ message: `Hello, ${req.user.email}! You accessed a protected route.` });
});

export default router;
