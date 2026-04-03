import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  PENDING: "#facc15", // Yellow
  CONFIRMED: "#3b82f6", // Blue
  SHIPPED: "#8b5cf6", // Purple
  DELIVERED: "#4ade80", // Green
  CANCELLED: "#f87171", // Red
};

const DashboardAnalytics = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [salesData, setSalesData] = useState([]);
  const [topSoldBooks, setTopSoldBooks] = useState([]);
  const [orderStatusChartData, setOrderStatusChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingBestSeller, setAddingBestSeller] = useState(false);

  const [aiInsights, setAiInsights] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAnalytics = async (selectedYear) => {
    try {
      setLoading(true);
      const salesRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/analytics/sales/${selectedYear}`,
        { withCredentials: true },
      );

      const topBookRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/analytics/top/books/sales/${selectedYear}`,
        { withCredentials: true },
      );

      const chartRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/analytics/order/status/chart/${selectedYear}`,
        {
          withCredentials: true,
        },
      );

      if (salesRes.data.success) {
        setSalesData(salesRes.data.sales);
      }

      if (topBookRes.data.success) {
        setTopSoldBooks(topBookRes.data.topSoldBooks);
      }

      if (chartRes.data.success) {
        setOrderStatusChartData(chartRes.data.orderChartData);
      }
    } catch (error) {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async (selectedYear) => {
    try {
      setAiLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/analytics/ai/insights/${selectedYear}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setAiInsights(res.data.insights);
      }
    } catch (error) {
      toast.error("Failed to load AI insights");
    } finally {
      setAiLoading(false);
    }
  };

  const addBestSeller = async () => {
    try {
      setAddingBestSeller(true);
      const res = await axios.post(
        `http://localhost:5000/api/v1/bestseller/add/${year}`,
        {},
        { withCredentials: true },
      );

      if (res?.data?.success) {
        toast.success(res?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setAddingBestSeller(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(year);
    fetchAIInsights(year);
  }, [year]);

  const totalRevenue = salesData.reduce(
    (sum, item) => sum + item.totalRevenue,
    0,
  );
  const totalOrders = salesData.reduce(
    (sum, item) => sum + item.totalOrders,
    0,
  );

  const monthNames = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = salesData.map((item) => ({
    month: monthNames[item.month],
    revenue: item.totalRevenue,
    orders: item.totalOrders,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sales Analytics</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="select select-bordered"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2022, 2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Total Revenue</h2>
            <p className="text-2xl font-bold">$ {totalRevenue}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Total Orders</h2>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Year</h2>
            <p className="text-2xl font-bold">{year}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <p className="text-center">Loading analytics...</p>
      ) : chartData.length === 0 ? (
        <p className="text-center">No sales data for this year</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Bar Chart */}
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={"month"} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Line Chart */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Monthly Orders</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Sold Books Bar Chart */}
      {topSoldBooks.length > 0 && (
        <div className="card bg-base-100 shadow mt-6">
          <div className="card-body">
            <h2 className="card-title">Top Sold Books Of Year</h2>
            <button
              className="btn btn-soft btn-primary inline-block"
              onClick={addBestSeller}
            >
              Create Best Seller
            </button>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={topSoldBooks}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="bookName"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQty" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {orderStatusChartData.length > 0 && (
        <div className="card bg-base-100 shadow mt-6">
          <div className="card-body">
            <h2 className="card-title">Order Status Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusChartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {orderStatusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Business Insights */}
      <div className="card bg-linear-to-r from-indigo-50 to-purple-50 shadow mt-6">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🧠</span>
            <h2 className="card-title">AI Business Insights</h2>
          </div>

          {aiLoading ? (
            <p className="text-gray-500">Analyzing data with AI...</p>
          ) : aiInsights ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {aiInsights}
            </pre>
          ) : (
            <p className="text-gray-500">No insights available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
