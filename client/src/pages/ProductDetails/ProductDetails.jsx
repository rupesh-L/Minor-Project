// BookDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../redux/slice/cartSlice/cartSlice";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // Review form state
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/book/${id}`,
        );
        setBook(res.data.book);
        setRelatedBooks(res.data.suggestions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Reset review form on book change
  useEffect(() => {
    setReview({ rating: 5, comment: "" });
    window.scrollTo(0, 0);
  }, [id]);

  // Review handlers
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReview((prev) => ({ ...prev, [name]: value }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.comment) {
      toast.error("Please add a comment");
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/book/review/${id}`,
        review,
        { withCredentials: true },
      );

      if (res?.data?.success) {
        toast.success("Review submitted!");
        setBook(res.data.book); // Update book with new review
        setReview({ rating: 5, comment: "" });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Add to Cart using Redux
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }

    if (book.stock === 0) {
      toast.error("Book is out of stock");
      return;
    }

    try {
      setAddingToCart(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/cart`,
        {
          bookId: book._id,
          quantity: 1,
        },
        {
          withCredentials: true,
        },
      );

      if (res?.data?.success) {
        dispatch(setCart(res.data.cart)); // ✅ update cart state
        toast.success("Book added to cart!");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add book to cart",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-center mt-10">Loading...</p>
      </div>
    );
  if (!book) return <p className="text-center mt-10">Book not found</p>;

  return (
    <div className="min-h-screen bg-base-200 px-4 py-8">
      {/* Book Info */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <img
            src={book.coverImage || "https://via.placeholder.com/300x400"}
            alt={book.bookName}
            className="w-full object-cover rounded-lg shadow-md"
          />
        </div>

        <div className="w-full md:w-2/3 space-y-4">
          <h2 className="text-3xl font-bold">{book.bookName}</h2>
          <p className="text-sm text-gray-500">by {book.author}</p>
          <p className="text-gray-600">{book.description}</p>
          <p>
            <strong>ISBN:</strong> {book.isbnNo}
          </p>
          <p>
            <strong>Category:</strong> {book.category}
          </p>
          <p>
            <strong>Price:</strong> ${book.price.toFixed(2)}
          </p>
          <p>
            <strong>Stock Quantity:</strong> {book.stock}
          </p>
          <p>
            <strong>Average Rating:</strong>{" "}
            <span className="badge badge-primary">
              ⭐ {book.averageRating.toFixed(1)}
            </span>{" "}
            ({book.totalRatings} reviews)
          </p>
          <button
            className="btn btn-primary mt-2"
            onClick={handleAddToCart}
            disabled={book.stock === 0}
          >
            {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4">Reviews</h3>
        {book.reviews.length === 0 && <p>No reviews yet</p>}
        <div className="space-y-4">
          {book.reviews.map((r) => (
            <div key={r._id} className="p-4 bg-base-100 rounded shadow">
              <p>
                <strong>{r.user.fullName || "Anonymous"}</strong> - ⭐{" "}
                {r.rating}
              </p>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {user && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Write a Review</h3>
          <form onSubmit={submitReview} className="space-y-4 max-w-md">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Rating</span>
              </label>
              <select
                name="rating"
                value={review.rating}
                onChange={handleReviewChange}
                className="select select-bordered w-full"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 && "s"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Comment</span>
              </label>
              <textarea
                name="comment"
                value={review.comment}
                onChange={handleReviewChange}
                className="textarea textarea-bordered w-full"
                placeholder="Write your review..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submittingReview}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Related Books */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4">Related Books</h3>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {relatedBooks.map((b) => (
            <div key={b._id} className="card bg-base-100 shadow-md">
              <figure className="h-40 overflow-hidden">
                <img
                  src={b.coverImage || "https://via.placeholder.com/150x200"}
                  alt={b.bookName}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h4 className="card-title text-sm">{b.bookName}</h4>
                <span className="badge badge-primary">
                  ⭐ {b.averageRating.toFixed(1)}
                </span>
                <div className="card-actions justify-end mt-2">
                  <Link
                    to={`/book/${b._id}`}
                    className="btn btn-outline btn-sm btn-primary"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
