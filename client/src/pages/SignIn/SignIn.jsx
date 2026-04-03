// SignIn.jsx
import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/slice/authSlice/auth.slice";
import { setCart } from "../../redux/slice/cartSlice/cartSlice";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    try {
      dispatch(signInStart());
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/signin",
        { email, password },
        {
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        dispatch(signInSuccess(res?.data?.data));
        toast.success(res?.data?.message || "Login successful");
      }

      const cartRes = await axios.get("http://localhost:5000/api/v1/cart/get", {
        withCredentials: true,
      });

      if (cartRes?.data?.success) {
        dispatch(setCart(cartRes.data.cart));
      } else {
        toast.error("Unable to load your cart");
      }
      navigate("/");
    } catch (error) {
      dispatch(signInFailure());
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return user ? (
    <Navigate to="/" replace />
  ) : (
    <div className="flex justify-center items-center min-h-screen bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary">
            Sign In
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="link link-primary">
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary w-full">
                Sign In
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="link link-primary font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
