import { appError } from "../utils/appError.js";
import Book from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import sanitize from "mongo-sanitize";
import { generateAndSaveEmbedding } from "../utils/embeddings.js";

export const createBook = async (req, res) => {
  try {
    const { bookName, isbnNo, author, description, category, price, stock } =
      sanitize(req.body);

    if (
      !bookName ||
      !isbnNo ||
      !author ||
      !description ||
      !category ||
      !price ||
      !stock
    ) {
      return appError(res, 400, "Please fill all required fields");
    }

    if (price <= 0) {
      return appError(
        res,
        400,
        "Invalid product price. Should be greater than zero",
      );
    }

    if (stock <= 0) {
      return appError(
        res,
        400,
        "Can not create new product without any stock value.",
      );
    }

    let coverImage = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      coverImage = result.secure_url;
    }

    const book = await Book.create({
      bookName,
      isbnNo,
      author,
      description,
      category,
      price,
      coverImage,
      stock,
      createdBy: req.user._id,
    });

    await generateAndSaveEmbedding(book._id);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, error.message || "Internal Server Error");
  }
};

export const updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {
      bookName,
      isbnNo,
      author,
      description,
      category,
      price,
      stock,
      isActive,
    } = sanitize(req.body);

    if (!bookId) {
      return appError(res, 400, "Book Id is required to update it");
    }

    const bookExisted = await Book.findById(bookId);

    if (!bookExisted) {
      return appError(res, 404, "Book Not found");
    }

    if (bookName) {
      bookExisted.bookName = bookName;
    }

    if (isbnNo) {
      bookExisted.isbnNo = isbnNo;
    }

    if (author) {
      bookExisted.author = author;
    }

    if (description) {
      bookExisted.description = description;
    }

    if (category) {
      bookExisted.category = category;
    }

    if (price !== undefined) {
      if (price <= 0) {
        return appError(
          res,
          400,
          "Please enter a valid price. Should be greater than zero",
        );
      }
      bookExisted.price = price;
    }

    if (stock !== undefined) {
      if (stock < 0) {
        return appError(res, 400, "Stock value can not be negative");
      }
      bookExisted.stock = Number(bookExisted.stock) + Number(stock);
    }

    if (isActive !== undefined) {
      bookExisted.isActive = isActive;
    }

    let coverImage = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      coverImage = result.secure_url;
      bookExisted.coverImage = coverImage;
    }

    await bookExisted.save();
    await generateAndSaveEmbedding(bookExisted._id);

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book: bookExisted,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    console.log(req.body);

    const { bookId } = req.params;
    const user = req.user;

    const book = await Book.findById(bookId);
    if (!book) return appError(res, 404, "Book not found");

    // Check if user already reviewed
    const alreadyReviewed = book.reviews.find(
      (rev) => rev.user.toString() === user._id.toString(),
    );

    if (alreadyReviewed) {
      return appError(res, 400, "You already reviewed this book");
    }

    // Add review
    if (
      (rating === undefined || rating === null) &&
      (!comment || comment.trim() === "")
    ) {
      return appError(res, 400, "Please provide a rating or a comment");
    }

    const review = {
      user: user._id,
    };

    if (rating !== undefined) {
      if (rating <= 0 || rating > 5) {
        return appError(res, 400, "Rating must be between 0 and 5");
      }
      review.rating = rating;
    }

    if (comment && comment.trim() !== "") {
      review.comment = comment.trim();
    }

    book.reviews.push(review);

    // Update average rating and totalRatings
    book.totalRatings = book.reviews.length;
    book.averageRating =
      book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.totalRatings;

    await book.save();

    // await embedBook(book);

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      book,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 15,
    } = req.query;

    // 1. Build query object
    const query = {
      isActive: true,
    };

    // 🔍 Search (bookName OR author)
    if (search) {
      query.$or = [
        { bookName: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // 📚 Category filter
    if (category) {
      query.category = category;
    }

    // 💰 Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // status filter
    query.isActive = true;

    // 2. Pagination calculation
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // 3. Fetch data
    const books = await Book.find(query)
      .sort({ averageRating: -1, price: 1, createdAt: -1 }) // ratingsAverage renamed to averageRating in your schema
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "reviews.user", // populate the nested user inside reviews array
        select: "fullName email", // select fields you want
      });

    // 4. Total count for pagination
    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limitNumber);

    return res.status(200).json({
      success: true,
      totalBooks,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      books,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const globalSearch = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === "") {
      return appError(res, 400, "Search query is required");
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const searchQuery = {
      isActive: true,
      $or: [
        { bookName: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    const books = await Book.find(searchQuery)
      .sort({
        averateRating: -1,
        totalRatings: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber);

    const totalResults = await Book.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalResults / limitNumber);

    return res.status(200).json({
      success: true,
      query: q,
      totalResults,
      totalPages,
      currentPage: pageNumber,
      results: books,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return appError(res, 404, "Book with this id not found");
    }

    const book = await Book.findById(bookId).populate({
      path: "reviews.user", // populate the user field inside reviews
      select: "fullName", // only select fullName
    });

    const suggestions = await Book.aggregate([
      {
        $match: {
          category: book.category,
          _id: { $ne: book._id },
          isActive: true,
        },
      },
      {
        $facet: {
          topRated: [
            { $sort: { averageRating: -1, totalRatings: -1, createdAt: -1 } },
            { $limit: 3 }, // top 3 books
          ],
          randomBooks: [
            { $sample: { size: 2 } }, // 2 random books
          ],
        },
      },
      {
        $project: {
          suggestions: { $setUnion: ["$topRated", "$randomBooks"] },
        },
      },
      { $unwind: "$suggestions" },
      { $replaceRoot: { newRoot: "$suggestions" } }, // flatten
    ]);

    return res.status(200).json({
      success: true,
      message: "Book fetched",
      book,
      suggestions,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};
