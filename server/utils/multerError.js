import multer from "multer";
import { appError } from "../utils/appError.js";

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return appError(res, 400, "Image size exceeds 2MB limit");
    }

    return appError(res, 400, err.message);
  }

  if (err) {
    return appError(res, 400, err.message);
  }

  next();
};
