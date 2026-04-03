import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getBestSellerBooks,
  markBestSellersByYear,
} from "../controllers/bestSeller.controller.js";

const router = express.Router();

router.post("/add/:year", isAuthenticated, isAdmin, markBestSellersByYear);
router.get("/", getBestSellerBooks);

export default router;
