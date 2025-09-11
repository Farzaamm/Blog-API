import express from "express";
import { registerUser, loginUser, getCurrentUser } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/me", protect, getCurrentUser);

export default router;
