// SignUp.jsx
import axios from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/signup",
        formData
      );

      if (res?.data?.success) {
        localStorage.setItem("pendingEmail", formData.email);

        toast.success(
          res?.data?.message || "Signup successful. OTP sent to your email."
        );

        navigate("/signin");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const pendingEmail = localStorage.getItem("pendingEmail");

    if (!pendingEmail) {
      toast.error("No pending email found. Please signup again.");
      return;
    }

    try {
      setResending(true);

      const res = await axios.post(
        "http://localhost:5000/api/v1/user/otp/resend",
        { email: pendingEmail }
      );

      if (res?.data?.success) {
        toast.success(res?.data?.message || "OTP resent to your email.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to resend OTP. Try again."
      );
    } finally {
      setResending(false);
    }
  };

  return user ? (
    <Navigate to={"/"} replace />
  ) : (
    <div className="flex justify-center items-center min-h-screen bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className="input input-bordered w-full"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">
                  Phone Number (Optional)
                </span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="+97798XXXXXX"
                className="input input-bordered w-full"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={submitting}
              >
                {submitting ? "Please wait..." : "Sign Up"}
              </button>
            </div>
          </form>

          {/* OTP */}
          <div className="mt-4 text-center">
            <p className="text-sm">Didn't receive OTP?</p>
            <button
              onClick={handleResendOtp}
              className="btn btn-outline btn-secondary btn-sm mt-2"
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          {/* Sign In */}
          <p className="text-center text-sm mt-6">
            Already have an account?{" "}
            <Link to="/signin" className="link link-primary font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
