import express from "express";
import {
  forgotPassword,
  signIn,
  signOut,
  signUp,
  verifyForgotPasswrodOtp,
  verifySignUpOtp,
} from "../controllers/auth.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/verify/signup/otp", verifySignUpOtp);
router.post("/signin", signIn);
router.get("/signout", signOut);
router.post("/password/forgot", forgotPassword);
router.post("/verify/password/otp", verifyForgotPasswrodOtp);

export default router;
