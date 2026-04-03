import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/order/get`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        setOrders(res.data.allOrders);
      }
    } catch (error) {
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Expand / collapse
  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // ❌ Cancel Order (USER)
  const handleCancelOrder = async (orderId, paymentStatus) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancelLoading(orderId);

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/order/update/${orderId}`,
        { orderStatus: "CANCELLED", paymentStatus },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Order cancelled successfully");
        fetchOrders(); // refresh orders
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return <p className="text-center">Loading orders...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center py-4">My Orders</h1>

      <div className="overflow-x-auto shadow rounded">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-amber-500">
            <tr>
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Order Status</th>

              <th className="p-2 border">Cancelled By</th>

              <th className="p-2 border">Payment Method</th>
              <th className="p-2 border">Payment Status</th>
              <th className="p-2 border">Placed At</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  You have not placed any orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-green-600 transition">
                    <td className="p-2 border">{order._id}</td>
                    <td className="p-2 border">${order.totalPrice}</td>
                    <td className="p-2 border">{order.orderStatus}</td>
                    {order.orderStatus === "CANCELLED" ? (
                      <td className="p-2 border">{order.cancelledBy}</td>
                    ) : (
                      <td className="p-2 border">--------</td>
                    )}
                    <td className="p-2 border">{order.paymentMethod}</td>
                    <td className="p-2 border">{order.paymentStatus}</td>
                    <td className="p-2 border">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>

                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-gray-300 hover:text-black transition"
                      >
                        {expandedOrderId === order._id
                          ? "Hide Details"
                          : "View Details"}
                      </button>

                      {/*  Cancel Button (ONLY when allowed) */}
                      {order.orderStatus === "PENDING" && (
                        <button
                          onClick={() =>
                            handleCancelOrder(order._id, order.paymentStatus)
                          }
                          disabled={cancelLoading === order._id}
                          className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-gray-100 transition hover:text-black"
                        >
                          {cancelLoading === order._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Order Details */}
                  {expandedOrderId === order._id && (
                    <tr>
                      <td colSpan="7" className="p-4">
                        <div className="space-y-3">
                          {/* Shipping Address */}
                          <div>
                            <h3 className="font-bold">Shipping Address</h3>
                            <p>
                              {order.shippingAddress.fullName},{" "}
                              {order.shippingAddress.phone}
                            </p>
                            <p>
                              {order.shippingAddress.streetName},{" "}
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state},{" "}
                              {order.shippingAddress.postalCode},{" "}
                              {order.shippingAddress.country}
                            </p>
                          </div>

                          {/* Items */}
                          <div>
                            <h3 className="font-bold">Ordered Items</h3>
                            <table className="table-auto w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className="p-2 border">Book</th>
                                  <th className="p-2 border">Price</th>
                                  <th className="p-2 border">Quantity</th>
                                  <th className="p-2 border">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item) => (
                                  <tr
                                    key={item._id}
                                    className="hover:bg-green-600"
                                  >
                                    <td className="p-2 border">
                                      {item.book?.bookName || "Book deleted"}
                                    </td>
                                    <td className="p-2 border">
                                      ${item.price}
                                    </td>
                                    <td className="p-2 border">
                                      {item.quantity}
                                    </td>
                                    <td className="p-2 border">
                                      ${item.price * item.quantity}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
