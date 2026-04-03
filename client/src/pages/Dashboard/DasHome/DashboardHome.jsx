import { useOutletContext } from "react-router-dom";

const DashboardHome = () => {
  const { books, orders } = useOutletContext();

  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "PENDING",
  ).length;
  const outOfStockBooks = books.filter((b) => b.stock === 0).length;
  // 1 Filter delivered orders
  const deliveredOrders = orders.filter((o) => o.orderStatus === "DELIVERED");

  // 2 Calculate total revenue
  const totalRevenueGenerated = deliveredOrders.reduce(
    (acc, order) => acc + order.totalPrice,
    0,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Home</h1>

      <div className="p-4 shadow rounded text-center bg-gray-500">
        <h2 className="text-white">Total Delivered Orders</h2>
        <p className="text-2xl font-bold">{deliveredOrders.length}</p>
      </div>
      <div className="p-4 shadow rounded text-center bg-green-800">
        <h2 className="text-white">Total Revenue Generated</h2>
        <p className="text-2xl font-bold">${totalRevenueGenerated}</p>
      </div>
      <div className="p-4 shadow rounded text-center bg-red-500">
        <h2 className="text-white">Pending Orders</h2>
        <p className="text-2xl font-bold">{pendingOrders}</p>
      </div>
      <div className="p-4 shadow rounded text-center bg-yellow-500">
        <h2 className="text-white">Out-of-stock Books</h2>
        <p className="text-2xl font-bold">{outOfStockBooks}</p>
      </div>
    </div>
  );
};

export default DashboardHome;
