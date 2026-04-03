import Order from "../models/order.model.js";

/* Monthly sales */
export const getMonthlySalesByYearLogic = async (year) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  return Order.aggregate([
    {
      $match: {
        orderStatus: "DELIVERED",
        paymentStatus: "PAID",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalRevenue: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        totalRevenue: 1,
        totalOrders: 1,
      },
    },
  ]);
};

/* Top sold books */
export const getTopSoldBooksLogic = async (year) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  return Order.aggregate([
    {
      $match: {
        orderStatus: "DELIVERED",
        paymentStatus: "PAID",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.book",
        totalQty: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "book",
      },
    },
    { $unwind: "$book" },
    {
      $project: {
        _id: 0,
        bookId: "$book._id",
        bookName: "$book.bookName",
        bookAuthor: "$book.author",
        bookGenre: "$book.category",
        totalQty: 1,
      },
    },
  ]);
};

/* Order status pie data */
export const getPieChartOrderStatusLogic = async (year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
      },
    },
  ]);
};
