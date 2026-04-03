// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Book from "./models/product.model.js";

// dotenv.config();

// const books = [];

// const categories = [
//   "Fiction",
//   "Non-Fiction",
//   "Science",
//   "Biography",
//   "Fanstasy",
//   "History",
//   "Others",
// ];

// for (let i = 1; i <= 50; i++) {
//   books.push({
//     bookName: `Sample Book ${i}`,
//     isbnNo: 1000000000 + i,
//     author: `Author ${i}`,
//     description: `This is the description for Sample Book ${i}`,
//     category: categories[i % categories.length],
//     price: 100 + i * 10,
//     stock: i % 20,
//     coverImage: `https://placehold.co/600x800?text=Book+${i}`,
//     isActive: true,
//     createdBy: "695f3af1ed6e5df95fd0dee3",
//   });
// }

// const seedBooks = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB connected");

//     await Book.deleteMany();
//     console.log("🧹 Old books removed");

//     await Book.insertMany(books);
//     console.log("📚 50 books seeded successfully");

//     process.exit();
//   } catch (error) {
//     console.error("❌ Seeding failed:", error);
//     process.exit(1);
//   }
// };

// seedBooks();

import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/order.model.js";
import User from "./models/user.model.js";
import Book from "./models/product.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDateInYear = (year, month) => {
  const day = randomInt(1, 28);
  return new Date(year, month, day);
};

const seedOrders = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const users = await User.find();
    const books = await Book.find();

    if (!users.length || !books.length) {
      console.log("❌ Please seed users and books first");
      process.exit(1);
    }

    const orders = [];

    const years = [2023, 2024, 2025];

    for (const year of years) {
      for (let month = 0; month < 12; month++) {
        const ordersPerMonth = randomInt(5, 15); // 5–15 orders per month

        for (let i = 0; i < ordersPerMonth; i++) {
          const user = users[randomInt(0, users.length - 1)];
          const itemsCount = randomInt(1, 4);

          const items = [];
          let totalPrice = 0;

          for (let j = 0; j < itemsCount; j++) {
            const book = books[randomInt(0, books.length - 1)];
            const quantity = randomInt(1, 3);

            items.push({
              book: book._id,
              price: book.price,
              quantity,
            });

            totalPrice += book.price * quantity;
          }

          orders.push({
            user: user._id,
            items,
            totalPrice,
            orderStatus: "DELIVERED",
            paymentMethod: "COD",
            paymentStatus: "PAID",
            shippingAddress: {
              fullName: user.name || "Test User",
              phone: "9800000000",
              streetName: "Main Street",
              city: "Kathmandu",
              state: "Bagmati",
              postalCode: "44600",
              country: "Nepal",
            },
            createdAt: randomDateInYear(year, month),
            updatedAt: new Date(),
          });
        }
      }
    }

    await Order.insertMany(orders);
    console.log(`✅ Inserted ${orders.length} orders successfully`);

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding orders:", error);
    process.exit(1);
  }
};

seedOrders();
