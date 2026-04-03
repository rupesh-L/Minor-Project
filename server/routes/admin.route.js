import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getAdminAllBooks,
  getAdminAllOrders,
  getAIInsights,
  getAllUsers,
  getMonthlySalesByYear,
  getPieChartOrderStatusData,
  getTopSoldBooks,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.get("/books", isAuthenticated, isAdmin, getAdminAllBooks);
router.get("/orders", isAuthenticated, isAdmin, getAdminAllOrders);
router.get(
  "/analytics/sales/:year",
  isAuthenticated,
  isAdmin,
  getMonthlySalesByYear,
);
router.get(
  "/analytics/top/books/sales/:year",
  isAuthenticated,
  isAdmin,
  getTopSoldBooks,
);
router.get(
  "/analytics/order/status/chart/:year",
  isAuthenticated,
  isAdmin,
  getPieChartOrderStatusData,
);

router.get(
  "/analytics/ai/insights/:year",
  isAuthenticated,
  isAdmin,
  getAIInsights,
);

export default router;
