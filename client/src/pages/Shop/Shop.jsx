// Shop.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("averageRating");

  const limit = 8;

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      };

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/book`,
        {
          params,
        },
      );

      setBooks(res.data.books || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1); // reset to first page when filters change

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    fetchBooks();
  };

  if (loading)
    return <p className="text-center mt-10 text-lg">Loading books...</p>;

  return (
    <div className="min-h-screen bg-base-200 px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">
        Shop Books
      </h1>

      {/* Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="mb-6 flex flex-wrap gap-4 justify-center items-end"
      >
        {/* Search */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Search</span>
          </label>
          <input
            type="text"
            placeholder="Book name, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered"
          />
        </div>

        {/* Category */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          <select
            className="select select-bordered"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Science">Science</option>
            <option value="Biography">Biography</option>
            <option value="Fanstasy">Fanstasy</option>
            <option value="History">History</option>
            <option value="Fiction">Fiction</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Min Price</span>
          </label>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            min="0"
            onChange={(e) => setMinPrice(e.target.value)}
            className="input input-bordered"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Max Price</span>
          </label>
          <input
            type="number"
            placeholder="1000"
            value={maxPrice}
            min="0"
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input input-bordered"
          />
        </div>

        <button type="submit" className="btn btn-primary mt-6">
          Apply Filters
        </button>
      </form>

      {/* Books Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <div
            key={book._id}
            className="card bg-base-100 shadow-md hover:shadow-2xl transition duration-700"
          >
            <figure className="h-60 overflow-hidden">
              <img
                src={book.coverImage || "https://via.placeholder.com/200x250"}
                alt={book.bookName}
                className="w-full h-full object-cover hover:scale-125 transition-all hover:rotate-12"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-lg font-semibold">
                {book.bookName}
              </h2>
              <p className="text-sm text-gray-500">by {book.author}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge badge-primary">
                  ⭐ {book.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">
                  ({book.totalRatings} reviews)
                </span>
              </div>
              <p className="font-semibold mt-2">${book.price.toFixed(2)}</p>
              <div className="card-actions justify-end mt-4">
                <Link
                  to={`/book/${book._id}`}
                  className="btn btn-outline btn-primary btn-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10 gap-2">
        <button
          className="btn btn-outline btn-primary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className="btn btn-disabled">{page}</span>
        <button
          className="btn btn-outline btn-primary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Shop;
