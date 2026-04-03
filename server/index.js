import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { connectDB } from "./utils/connectDB.js";
import connectRedis from "./utils/redis.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import bookRoutes from "./routes/product.route.js";
import adminRoutes from "./routes/admin.route.js";
import cartRoutes from "./routes/cart.route.js";
import bestSellerRoutes from "./routes/bestSeller.route.js";
import chatRoutes from "./routes/chat.route.js";
import orderRoutes from "./routes/order.route.js";

import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";

import http from "http";
import { Server } from "socket.io";
import Message from "./models/notification.model.js";
import { cleanDb } from "./utils/cron.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// EXPORT GLOBAL SOCKET + USERS
export let io;
export const onlineUsers = new Map();

// middlewares
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/bestseller", bestSellerRoutes);
app.use("/api/v1/chat", chatRoutes);

// create server
const server = http.createServer(app);

// attach socket
io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

// socket logic
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // register user
  socket.on("register", async (userId) => {
    onlineUsers.set(userId, socket.id);

    // send old notifications
    const oldMessages = await Message.find({ receiverId: userId }).sort({
      createdAt: -1,
    });
    socket.emit("loadMessages", oldMessages);
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// start server
const startServer = async () => {
  try {
    await connectDB();
    cron.schedule("*/59 * * * *", async () => await cleanDb());
    try {
      await connectRedis();
    } catch (err) {
      console.log("Redis down");
    }

    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();
