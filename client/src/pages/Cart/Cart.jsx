import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../redux/slice/cartSlice/cartSlice";

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // ✅ per-item state

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  // ✅ Fetch cart
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/v1/cart/get", {
        withCredentials: true,
      });

      if (res?.data?.success) {
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "📚 Cart";
    fetchCart();
  }, []);

  // ✅ Initialize quantities when cart updates
  useEffect(() => {
    if (cart?.items) {
      const initial = {};
      cart.items.forEach((item) => {
        initial[item.book._id] = item.quantity;
      });
      setQuantities(initial);
    }
  }, [cart]);

  // ✅ Handle quantity change
  const handleQuantityChange = (bookId, value) => {
    if (value < 1) return;

    setQuantities((prev) => ({
      ...prev,
      [bookId]: value,
    }));
  };

  // ✅ Remove item
  const removeItem = async (bookId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/v1/cart/remove",
        { bookId },
        { withCredentials: true },
      );

      if (res?.data?.success) {
        toast.success("Item removed");
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // ✅ Update item
  const updateItem = async (bookId) => {
    try {
      const quantity = Number(quantities[bookId]);

      if (!quantity || quantity <= 0) {
        return toast.error("Invalid quantity");
      }

      const res = await axios.put(
        // 🔥 change to PUT if backend uses PUT
        "http://localhost:5000/api/v1/cart/update",
        { productId: bookId, quantity },
        { withCredentials: true },
      );

      if (res?.data?.success) {
        toast.success("Item updated");
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update item");
    }
  };

  // ✅ Loading
  if (loading) {
    return <p className="text-center mt-10">Loading cart...</p>;
  }

  // ✅ Empty cart
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <Link to="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid gap-6">
        {cart.items.map((item) => (
          <div
            key={item.book._id}
            className="flex flex-col md:flex-row items-center gap-4 bg-base-100 p-4 rounded shadow"
          >
            {/* Image */}
            <img
              src={item.book.coverImage}
              alt={item.book.bookName}
              className="w-24 h-32 object-cover rounded"
            />

            {/* Details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.book.bookName}</h3>
              <p className="text-sm text-gray-500">by {item.book.author}</p>

              <p className="mt-1">
                Price: <strong>${item.book.price}</strong>
              </p>

              <p>
                Quantity: <strong>{item.quantity}</strong>
              </p>

              <p>
                Item Total: <strong>${item.book.price * item.quantity}</strong>
              </p>

              {/* ✅ Update Quantity */}
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantities[item.book._id] || item.quantity}
                  className="input input-bordered input-sm w-20"
                  onChange={(e) =>
                    handleQuantityChange(item.book._id, Number(e.target.value))
                  }
                />

                <button
                  onClick={() => updateItem(item.book._id)}
                  className="btn btn-outline btn-info btn-sm"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.book._id)}
              className="btn btn-outline btn-error btn-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* ✅ Summary */}
      <div className="mt-8 bg-base-100 p-6 rounded shadow max-w-md ml-auto">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <p className="text-lg">
          Total Price: <strong>${cart.totalPrice}</strong>
        </p>

        <Link to="/checkout" className="btn btn-primary w-full mt-4">
          Proceed to Checkout
        </Link>
        <Link to="/shop" className="btn btn-secondary w-full mt-4">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Cart;
