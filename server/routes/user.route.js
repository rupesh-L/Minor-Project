import express from "express";
import {
  getProfile,
  resendVerifyOtp,
  updateProfile,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile", isAuthenticated, getProfile);
router.put("/profile/update", isAuthenticated, updateProfile);
router.post("/otp/resend", resendVerifyOtp);

export default router;
