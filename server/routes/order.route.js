import express from "express";
import {
  getUserOrders,
  placeOrder,
  updateOrder,
} from "../controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, placeOrder);
router.get("/get", isAuthenticated, getUserOrders);
router.put("/update/:orderId", isAuthenticated, updateOrder);

export default router;
