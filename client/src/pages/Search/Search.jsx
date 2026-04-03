// SearchPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchResults = async (page = 1) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/book/search?q=${encodeURIComponent(
          query,
        )}&page=${page}&limit=10`,
      );

      if (res?.data?.success) {
        setResults(res.data.results || []);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch search results",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(1);
  }, [query]);

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    fetchResults(page);
  };

  if (!query.trim())
    return <p className="text-center mt-10">Enter a search query.</p>;

  return (
    <div className="min-h-screen px-4 py-8 bg-base-200">
      <h2 className="text-2xl font-semibold mb-4">
        Search results for: <span className="text-primary">{query}</span>
      </h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-center">No results found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((book) => (
            <div
              key={book._id}
              className="card bg-base-100 shadow-md hover:shadow-2xl transition duration-700 "
            >
              <figure className="h-40 overflow-hidden">
                <img
                  src={book.coverImage || "https://via.placeholder.com/150x200"}
                  alt={book.bookName}
                  className="w-full h-full object-cover hover:scale-125 transition-all hover:rotate-12"
                />
              </figure>
              <div className="card-body">
                <h4 className="card-title text-sm">{book.bookName}</h4>
                <p className="text-xs text-gray-500">by {book.author}</p>
                <span className="badge badge-primary">
                  ⭐{" "}
                  {book.averageRating ? book.averageRating.toFixed(1) : "0.0"}
                </span>
                <div className="card-actions justify-end mt-2">
                  <Link
                    to={`/book/${book._id}`}
                    className="btn btn-outline btn-sm btn-primary"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`btn btn-sm ${
                currentPage === i + 1 ? "btn-primary" : "btn-ghost"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
