import express from "express";
import {
  addReview,
  createBook,
  getAllBooks,
  getBook,
  globalSearch,
  updateBook,
} from "../controllers/product.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";
import upload from "../utils/multer.js";
import { handleMulterError } from "../utils/multerError.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  isAdmin,
  upload.single("coverImage"),
  handleMulterError,
  createBook
);

router.put(
  "/update/:bookId",
  isAuthenticated,
  isAdmin,
  upload.single("coverImage"),
  handleMulterError,
  updateBook
);

router.post("/review/:bookId", isAuthenticated, addReview);

router.get("/", getAllBooks);

router.get("/search", globalSearch);

router.get("/:bookId", getBook);

export default router;
