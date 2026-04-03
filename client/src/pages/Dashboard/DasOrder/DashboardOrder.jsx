import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import React from "react";

const DashboardOrder = () => {
  const { orders: initialOrders, fetchSummary } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [formData, setFormData] = useState({
    orderStatus: "",
  });

  // Reload-safe sync
  useEffect(() => {
    if (!initialOrders || initialOrders.length === 0) {
      fetchSummary();
    } else {
      setOrders(initialOrders);
    }
  }, [initialOrders, fetchSummary]);

  // 🔍 Fetch filtered orders
  const fetchFilteredOrders = async (status) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/admin/orders?status=${status}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setOrders(res.data.allOrders);
      }
    } catch (error) {
      toast.error("Failed to filter orders");
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    if (value === "") {
      fetchSummary(); // reset to all orders
    } else {
      fetchFilteredOrders(value);
    }
  };

  // Start editing
  const handleEdit = (order) => {
    setEditingOrderId(order._id);
    setFormData({
      orderStatus: order.orderStatus,
    });
  };

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update order
  const handleUpdate = async (orderId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/v1/order/update/${orderId}`,
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Order updated successfully");
        setEditingOrderId(null);
        fetchSummary(); // refresh orders
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update order");
    }
  };

  // Expand/collapse order details
  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Orders</h1>

      {/* 🔍 Order Status Filter */}
      <div className="flex items-center gap-3">
        <label className="font-semibold">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={handleFilterChange}
          className="border p-2 rounded bg-gray-500"
        >
          <option value="">All</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className="overflow-x-auto shadow rounded">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-amber-500">
            <tr>
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Total Price</th>
              <th className="p-2 border">Order Status</th>
              <th className="p-2 border">Payment Method</th>
              <th className="p-2 border">Payment Status</th>
              <th className="p-2 border">Cancelled By</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-4 text-center">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-green-600 transition">
                    <td className="p-2 border">{order._id}</td>
                    <td className="p-2 border">{order.user}</td>
                    <td className="p-2 border">${order.totalPrice}</td>

                    {/* Editable Order Status */}
                    <td className="p-2 border">
                      {editingOrderId === order._id ? (
                        <select
                          name="orderStatus"
                          value={formData.orderStatus}
                          onChange={handleChange}
                          className="border p-1 w-full bg-gray-500"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      ) : (
                        order.orderStatus
                      )}
                    </td>

                    <td className="p-2 border">{order.paymentMethod}</td>
                    <td className="p-2 border">{order.paymentStatus}</td>
                    <td className="p-2 border">{order.cancelledBy || "-"}</td>
                    <td className="p-2 border">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="p-2 border space-x-2">
                      {editingOrderId === order._id ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdate(order._id)}
                            className="bg-gray-500 text-white px-3 py-1 rounded cursor-pointer mb-0.5"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setEditingOrderId(null)}
                            className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer mb-0.5"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(order)}
                          className="bg-blue-600 text-white px-3 py-1 rounded w-full cursor-pointer mb-0.5 hover:bg-gray-300 hover:text-black transition"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded w-full cursor-pointer hover:bg-gray-200 hover:text-black"
                      >
                        {expandedOrderId === order._id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded order details */}
                  {expandedOrderId === order._id && (
                    <tr className="">
                      <td colSpan="9" className="p-4">
                        <div className="space-y-2">
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

                          <h3 className="font-bold mt-2">Items</h3>
                          <table className="table-auto w-full text-left border-collapse">
                            <thead className="">
                              <tr>
                                <th className="p-2 border">Book ID</th>
                                <th className="p-2 border">Book Name</th>
                                <th className="p-2 border">Price</th>
                                <th className="p-2 border">Bought At</th>
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
                                    {item.book._id}
                                  </td>
                                  <td className="p-2 border">
                                    {item.book.bookName}
                                  </td>
                                  <td className="p-2 border">
                                    ${item.book.price}
                                  </td>
                                  <td className="p-2 border">${item.price}</td>
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

export default DashboardOrder;
