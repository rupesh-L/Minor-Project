import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Book from "../models/product.model.js";
import { appError } from "../utils/appError.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod, shippingAddress } = req.body;

    // 1️ Validate input
    if (!paymentMethod || !shippingAddress) {
      return appError(res, 400, "Payment method and address are required");
    }

    // 2️ Get cart
    const cart = await Cart.findOne({ user: userId }).populate("items.book");

    if (!cart || cart.items.length === 0) {
      return appError(res, 400, "Cart is empty. Cannot place order");
    }

    // 3️ Validate items & stock
    let orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const book = item.book;

      if (!book) {
        return appError(res, 404, "Book not found");
      }

      if (book.stock < item.quantity) {
        return appError(res, 400, `Insufficient stock for ${book.bookName}`);
      }

      // 4️ Snapshot price
      orderItems.push({
        book: book._id,
        price: book.price,
        quantity: item.quantity,
      });

      totalPrice += book.price * item.quantity;
    }

    // 5️ Ensure at least one order item
    if (orderItems.length === 0) {
      return appError(res, 400, "Order must contain at least one item");
    }

    // 6️ Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
      paymentMethod,
      shippingAddress,
    });

    // 7️ Reduce stock
    for (const item of cart.items) {
      await Book.findByIdAndUpdate(item.book._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // 8️ Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return appError(res, 500, "Internal Server Error");
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({ user: req.user._id })
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



import Message from "../models/notification.model.js";
import { io, onlineUsers } from "../index.js";

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const user = req.user;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    /* ================= USER ================= */
    if (user.role === "user") {
      if (order.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (orderStatus !== "CANCELLED") {
        return res.status(403).json({ message: "Only cancel allowed" });
      }

      if (order.orderStatus !== "PENDING") {
        return res.status(400).json({ message: "Cannot cancel" });
      }

      order.orderStatus = "CANCELLED";
      order.cancelledBy = "USER";

      if (order.paymentMethod === "ONLINE") {
        order.paymentStatus = "REFUNDED";
      } else {
        order.paymentStatus = "FAILED";
      }

      for (const item of order.items) {
        await Book.findByIdAndUpdate(item.book, {
          $inc: { stock: item.quantity },
        });
      }
    }

    /* ================= ADMIN ================= */
    if (user.role === "admin") {
      if (orderStatus) {
        if (order.orderStatus === "CANCELLED") {
          return res.status(400).json({ message: "Already cancelled" });
        }

        if (order.orderStatus === "DELIVERED") {
          return res.status(400).json({ message: "Already delivered" });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "CANCELLED") {
          order.cancelledBy = "ADMIN";

          for (const item of order.items) {
            await Book.findByIdAndUpdate(item.book, {
              $inc: { stock: item.quantity },
            });
          }
        }

        if (orderStatus === "DELIVERED") {
          order.paymentStatus = "PAID";
        }
      }
    }

    await order.save();

    /* ================= 🔥 NOTIFICATION ================= */

    let message = "";

    if (order.orderStatus === "CANCELLED") {
      message = "Your order has been cancelled";
    } else if (order.orderStatus === "DELIVERED") {
      message = "Your order has been delivered 🎉";
    } else {
      message = `Order status updated to ${order.orderStatus}`;
    }

    const updatedOrder = {
      orderStatus: order.orderStatus,
      orderId: order._id,
      orderItems: order.items,
    };

    // save to DB
    const newMsg = await Message.create({
      senderId: user._id,
      receiverId: order.user.toString(),
      message,
      updatedOrder,
    });

    // real-time send
    const userSocket = onlineUsers.get(order.user.toString());

    if (userSocket) {
      io.to(userSocket).emit("receiveMessage", newMsg);
    }

    return res.status(200).json({
      success: true,
      message: "Order updated",
      order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
