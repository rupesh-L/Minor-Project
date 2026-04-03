import "./index.css";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout/MainLayout";
import Home from "./pages/Home/Home";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyLayout from "./layout/VerifyLayout/VerifyLayout";
import VerifySignup from "./pages/Verify/VerifySignup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyResetPassword from "./pages/Verify/VerifyResetPassword";
import BookDetails from "./pages/ProductDetails/ProductDetails";
import Shop from "./pages/Shop/Shop";
import Contact from "./pages/Contact/Contact";
import Cart from "./pages/Cart/Cart";
import SearchPage from "./pages/Search/Search";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./routes/protectedRoute";
import AdminRoute from "./routes/adminProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DasHome/DashboardHome";
import DashboardUser from "./pages/Dashboard/DasUser/DashboardUser";
import DashboardBook from "./pages/Dashboard/DasBook/DashBoardBook";
import DashboardOrder from "./pages/Dashboard/DasOrder/DashboardOrder";
import Checkout from "./pages/Checkout/Checkout";
import Orders from "./pages/Orders/Orders";
import AddBook from "./pages/Dashboard/DasBook/AddBook";
import DashboardAnalytics from "./pages/Dashboard/DasAnalytics/DashboardAnalytics";
import ChatBot from "./components/ChatBot/ChatBot";
import NotificationListener from "./listeners/NotificationListener";
import Notification from "./pages/Notification/Notification";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<SearchPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
          <Route element={<VerifyLayout />}>
            <Route path="/verify/signup" element={<VerifySignup />} />
            <Route
              path="/verify/forgot/password"
              element={<VerifyResetPassword />}
            />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="users" element={<DashboardUser />} />
              <Route path="books">
                <Route index element={<DashboardBook />} />
                <Route path="add" element={<AddBook />} />
              </Route>
              <Route path="orders" element={<DashboardOrder />} />
              <Route path="sales" element={<DashboardAnalytics />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
      <NotificationListener />
      <ChatBot />
    </>
  );
};

export default App;
