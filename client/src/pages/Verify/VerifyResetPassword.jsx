import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/verify/password/otp",
        { email, ...formData }
      );

      if (res?.data?.success) {
        toast.success("Password reset successfully");
        navigate("/signin", { replace: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body space-y-4">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">
              Verify & Reset Password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter OTP and set your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                value={email || ""}
                readOnly
                className="input input-bordered w-full  cursor-not-allowed"
              />
            </div>

            {/* OTP */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">OTP</span>
              </label>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                className="input input-bordered w-full text-center tracking-widest text-lg"
                maxLength={6}
              />
            </div>

            {/* Passwords */}
            <div className="grid gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Confirm Password
                  </span>
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Confirm password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetPassword;
