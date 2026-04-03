import BestSeller from "../models/bestSeller.model.js";
import { getTopSoldBooksLogic } from "../services/ananlytics.service.js";
import { appError } from "../utils/appError.js";

export const markBestSellersByYear = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    // Do not allow before year ends
    const now = new Date();
    const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);

    if (now <= yearEnd) {
      return res.status(403).json({
        success: false,
        message: `Best sellers for ${year} can only be marked after the year ends`,
      });
    }

    // Calculate top 10 sold books
    const topBooks = await getTopSoldBooksLogic(year);

    if (!topBooks.length) {
      return res.status(400).json({
        success: false,
        message: "No sales data found for this year",
      });
    }

    // DELETE all previous best sellers
    await BestSeller.deleteMany({});

    // Insert new best sellers
    const bestSellers = topBooks.map((item) => ({
      book: item.bookId,
      bestSaleYear: new Date(`${year}-01-01`),
      tag: "BEST SELLER",
    }));

    await BestSeller.insertMany(bestSellers);

    return res.status(200).json({
      success: true,
      message: `Top 10 Best Sellers for ${year} marked successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getBestSellerBooks = async (req, res) => {
  try {
    const populatedBestSeller = await BestSeller.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $match: {
          "book.isActive": true,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      populatedBestSeller,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};
