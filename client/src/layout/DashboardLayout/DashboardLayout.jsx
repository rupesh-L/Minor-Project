import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  House,
  Users,
  BookOpenText,
  ShoppingBag,
  ChartLine,
} from "lucide-react";

const DashboardLayout = () => {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const [usersRes, booksRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/v1/admin/users", {
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/v1/admin/books", {
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/v1/admin/orders", {
          withCredentials: true,
        }),
      ]);

      setUsers(usersRes.data.users);
      setBooks(booksRes.data.books);
      setOrders(ordersRes.data.allOrders);
    } catch (error) {
      toast.error("Failed to load dashboard summary");
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }
          >
            <div className="flex items-center gap-8">
              <House />
              <p>Home</p>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/users"
            className={({ isActive }) =>
              `p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }
          >
            <div className="flex items-center gap-8">
              <Users />
              <p>Users</p>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/books"
            className={({ isActive }) =>
              `p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }
          >
            <div className="flex items-center gap-8">
              <BookOpenText />
              <p>Books</p>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/orders"
            className={({ isActive }) =>
              `p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }
          >
            <div className="flex items-center gap-8">
              <ShoppingBag />
              <p>Orders</p>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/sales"
            className={({ isActive }) =>
              `p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }
          >
            <div className="flex items-center gap-8">
              <ChartLine />
              <p>Analytics</p>
            </div>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 shadow rounded text-center bg-green-500/80">
            <h2 className="text-white">Total Users</h2>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="p-4 shadow rounded text-center bg-amber-400">
            <h2 className="text-white">Total Books</h2>
            <p className="text-2xl font-bold">{books.length}</p>
          </div>
          <div className="p-4 shadow rounded text-center bg-gray-500">
            <h2 className="text-white">Total Orders</h2>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="p-4 shadow rounded text-center bg-green-700">
            <h2 className="text-white">Expected Revenue</h2>
            <p className="text-2xl font-bold">${totalRevenue}</p>
          </div>
        </div>

        {/* Children pages rendered here */}
        <div>
          <Outlet context={{ users, books, orders, fetchSummary }} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
