// Header.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../../redux/slice/authSlice/auth.slice";
import { clearCart } from "../../redux/slice/cartSlice/cartSlice";
import NotificationBell from "../Notification/NotificationBell";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.length);

  // 🔍 Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  // 🔐 Handle sign out
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      dispatch(signOutStart());

      const res = await axios.get("http://localhost:5000/api/v1/auth/signout", {
        withCredentials: true,
      });

      if (res?.data?.success) {
        toast.success("Signout successful");
        dispatch(signOutSuccess());
        dispatch(clearCart());
      }
    } catch (error) {
      dispatch(signOutFailure());
      toast.error(error?.response?.data?.message || "Cannot signout now");
    } finally {
      setSigningOut(false);
    }
  };

  // ❌ Close search on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <div className="navbar bg-base-100 shadow-md px-4 relative">
        {/* Logo */}
        <div className="flex-1">
          <Link to="/" className="text-2xl font-bold text-primary">
            📚 Book Store
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-6">
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>
          <Link to="/shop" className="btn btn-ghost">
            Shop
          </Link>
          <Link to="/contact" className="btn btn-ghost">
            Contact Us
          </Link>
          <NotificationBell />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* 🔍 Search Button */}
          <button className="btn btn-ghost" onClick={() => setSearchOpen(true)}>
            <Search />
          </button>

          {/* 🛒 Cart */}
          <Link to="/cart" className="btn btn-ghost relative">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="badge badge-primary absolute -top-2 -right-2">
                {cartCount}
              </span>
            )}
          </Link>

          {/* 👤 Auth */}
          {!user ? (
            <Link to="/signin" className="btn btn-primary">
              Sign In
            </Link>
          ) : (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src="https://i.pravatar.cc/100" alt="avatar" />
                </div>
              </label>

              <ul className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <Link to="/profile">My Profile</Link>
                </li>
                <li>
                  <Link to="/orders">My Orders</Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                )}
                <li>
                  <button
                    className="text-error"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* 📱 Mobile Menu */}
          <button
            className="btn btn-ghost lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* 📱 Mobile Dropdown */}
        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-base-100 shadow-lg lg:hidden z-20">
            <ul className="menu p-4">
              <li>
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" onClick={() => setMenuOpen(false)}>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>
                  Contact Us
                </Link>
              </li>
              <NotificationBell />
            </ul>
          </div>
        )}
      </div>

      {/* ================= 🔍 SEARCH OVERLAY ================= */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearchSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-base-100 p-6 rounded-xl shadow-2xl flex items-center gap-3 w-[90%] md:w-125"
          >
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books..."
              className="input input-bordered w-full"
            />

            <button type="submit" className="btn btn-primary">
              Search
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setSearchOpen(false)}
            >
              <X />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
