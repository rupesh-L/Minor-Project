import Book from "../models/product.model.js";
import User from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import Order from "../models/order.model.js";
import {
  getMonthlySalesByYearLogic,
  getPieChartOrderStatusLogic,
  getTopSoldBooksLogic,
} from "../services/ananlytics.service.js";

export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    const totalUsers = await User.countDocuments();

    // Remove password field before sending
    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc; // destructure _doc to exclude password
      return rest;
    });

    // Send response
    return res.status(200).json({
      success: true,
      users: usersWithoutPassword,
      totalUsers,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getAdminAllBooks = async (req, res) => {
  try {
    const books = await Book.find();

    const totalBooks = await Book.countDocuments();

    return res.status(200).json({
      success: true,
      books,
      totalBooks,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getAdminAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status.toUpperCase();

    const allOrders = await Order.find(filter)
      .populate("items.book", "bookName price coverImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      allOrders,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getMonthlySalesByYear = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) {
      return appError(res, 400, "Year is required");
    }

    const sales = await getMonthlySalesByYearLogic(year);

    res.status(200).json({
      success: true,
      year: Number(year),
      sales,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getTopSoldBooks = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) {
      return appError(res, 400, "Year is required");
    }

    const topSoldBooks = await getTopSoldBooksLogic(year);

    res.status(200).json({
      success: true,
      year: Number(year),
      topSoldBooks,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getPieChartOrderStatusData = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) {
      return appError(res, 400, "Year is required");
    }

    const orderChartData = await getPieChartOrderStatusLogic(year);

    return res.status(200).json({
      success: true,
      year: Number(year),
      orderChartData,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getAIInsights = async (req, res) => {
  const { year } = req.params;

  const sales = await getMonthlySalesByYearLogic(year);
  const topBooks = await getTopSoldBooksLogic(year);
  const orderStatus = await getPieChartOrderStatusLogic(year);

  const prompt = `
You are a business analytics expert.
Analyze this data and give insights.

Sales: ${JSON.stringify(sales)}
Top Books: ${JSON.stringify(topBooks)}
Order Status: ${JSON.stringify(orderStatus)}
`;

  const aiRes = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
    }),
  });

  const data = await aiRes.json();

  res.json({
    success: true,
    insights: data.response,
  });
};
