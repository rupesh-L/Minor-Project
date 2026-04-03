import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  signOutSuccess,
  updateSuccess,
} from "../../redux/slice/authSlice/auth.slice";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../redux/slice/cartSlice/cartSlice";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/v1/user/profile", {
        withCredentials: true,
      });

      if (res?.data?.success) {
        setFormData({
          fullName: res.data.data.fullName || "",
          email: res.data.data.email || "",
          phoneNumber: res.data.data.phoneNumber || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const res = await axios.put(
        "http://localhost:5000/api/v1/user/profile/update",
        formData,
        { withCredentials: true },
      );

      if (res?.data?.success) {
        toast.success(res.data.message);

        // ⚠️ Email updated → backend clears token
        if (res.data.message.includes("verify")) {
          localStorage.setItem("pendingEmail", formData.email);
          toast.info("Please verify your email again");
          dispatch(signOutSuccess());
          dispatch(clearCart());
        } else {
          dispatch(updateSuccess(res.data.data));
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center mb-4">My Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <br />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <br />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered"
              />
              <br />
              <span className="text-xs text-warning mt-1">
                Changing email will require re-verification
              </span>
            </div>

            {/* Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
