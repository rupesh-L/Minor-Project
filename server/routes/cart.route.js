import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
} from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, addToCart);
router.get("/get", isAuthenticated, getCart);
router.post("/remove", isAuthenticated, removeFromCart);
router.put("/update", isAuthenticated, updateCart);

export default router;
