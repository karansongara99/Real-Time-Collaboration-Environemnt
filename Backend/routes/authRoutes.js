
import express from "express";
import { registerUser, loginUser, getAllUsers } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", protect, getAllUsers);

// Protected route example
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
