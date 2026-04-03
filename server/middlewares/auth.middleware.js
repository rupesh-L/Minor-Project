import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { appError } from "../utils/appError.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req?.cookies?.token;
    if (!token) {
      return appError(res, 401, "No Access Token - Please log in again");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return appError(res, 401, "Account not found. Please login again");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return appError(res, 401, "Invalid or expired token");
    }

    return appError(res, 500, "Internal Server Error");
  }
};

export const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return appError(res, 403, "Unauthorized. Admin only route");
    }

    next();
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};
