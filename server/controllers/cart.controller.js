import Book from "../models/product.model.js";
import { appError } from "../utils/appError.js";
import Cart from "../models/cart.model.js";
import { calculateTotalPrice } from "../utils/priceCalculation.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return appError(res, 404, "Please select book first to add to cart");
    }

    const book = await Book.findById(bookId);
    if (!book) return appError(res, 400, "Book not found");

    if (book.stock < quantity) return appError(res, 400, "Not enough stock");

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create a new cart
      cart = new Cart({
        user: userId,
        items: [{ book: bookId, quantity }],
      });
    } else {
      // Check if book already exists in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.book.toString() === bookId,
      );

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ book: bookId, quantity });
      }
    }

    // Save first so we can populate
    await cart.save();

    // Populate books before calculating total and sending
    await cart.populate("items.book");

    // Calculate total price
    calculateTotalPrice(cart);

    await cart.save(); // Save totalPrice

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.book",
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], totalPrice: 0 },
      });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.book");

    if (!cart) {
      return appError(res, 404, "Cart not found");
    }

    // Remove item
    cart.items = cart.items.filter(
      (item) => item.book._id.toString() !== bookId,
    );

    // Recalculate total price
    calculateTotalPrice(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const updateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const book = await Book.findById(productId);

    if (book.stock < quantity) {
      return appError(res, 400, `Limited stock ${book.stock}`);
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.book");

    if (!cart) {
      return appError(res, 404, "Cart not found");
    }

    // Find if product already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.book._id.toString() === productId,
    );

    if (itemIndex > -1) {
      // Product exists → update quantity
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        // If quantity is 0 → remove item
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return appError(res, 404, "Product not found in cart");
    }

    calculateTotalPrice(cart);

    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error(error);
    return appError(res, 500, "Internal Server Error");
  }
};
