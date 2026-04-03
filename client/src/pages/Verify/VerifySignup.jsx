import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const VerifySignup = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Invalid verification link");
      return;
    }

    try {
      setVerifying(true);

      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/verify/signup/otp",
        { email, otp }
      );

      if (res?.data?.success) {
        toast.success("Verified successfully");
        localStorage.removeItem("pendingEmail");
        navigate("/signin", { replace: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* single centered box */}
      <div className="w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Verify Signup
        </h2>

        <form onSubmit={handleVerify} className="space-y-3">
          {/* Email */}
          <input
            type="email"
            value={email || ""}
            readOnly
            className="input input-bordered w-full"
          />

          {/* OTP */}
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="input input-bordered w-full"
          />

          {/* Button */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifySignup;
