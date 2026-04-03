import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCart } from "../../redux/slice/cartSlice/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    streetName: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nepal",
  });

  // Handle address change
  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  // Place Order
  const placeOrder = async () => {
    if (!paymentMethod) {
      return toast.error("Select payment method");
    }

    if (paymentMethod !== "COD") {
      return toast.error("COD is only available for now.");
    }

    for (let key in shippingAddress) {
      if (!shippingAddress[key]) {
        return toast.error("All address fields are required");
      }
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/order`,
        {
          paymentMethod,
          shippingAddress,
        },
        { withCredentials: true },
      );

      if (res?.data?.success) {
        toast.success("Order placed successfully");

        // Clear cart in redux
        dispatch(setCart({ items: [], totalPrice: 0 }));

        navigate("/orders"); // or order success page
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto bg-base-100 p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Shipping Address */}
        <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="fullName"
            placeholder="Full Name"
            className="input input-bordered"
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone"
            className="input input-bordered"
            onChange={handleChange}
          />
          <input
            name="streetName"
            placeholder="Street Name"
            className="input input-bordered"
            onChange={handleChange}
          />
          <input
            name="city"
            placeholder="City"
            className="input input-bordered"
            onChange={handleChange}
          />
          <input
            name="state"
            placeholder="State"
            className="input input-bordered"
            onChange={handleChange}
          />
          <input
            name="postalCode"
            placeholder="Postal Code"
            className="input input-bordered"
            onChange={handleChange}
          />
        </div>

        {/* Payment */}
        <h2 className="text-lg font-semibold mt-6 mb-2">Payment Method</h2>

        <select
          className="select select-bordered w-full"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="COD">Cash on Delivery</option>
          <option value="ONLINE">Online Payment</option>
        </select>

        {/* Summary */}
        <div className="mt-6">
          <p className="text-lg">
            Total: <strong>${cart.totalPrice}</strong>
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="btn btn-primary w-full mt-6"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
