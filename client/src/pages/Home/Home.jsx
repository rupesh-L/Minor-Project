import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [bestSellerBooks, setBestSellerBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/v1/book?limit=8",
        );

        const bestSellerRes = await axios.get(
          "http://localhost:5000/api/v1/bestseller",
        );
        setBestSellerBooks(bestSellerRes.data.populatedBestSeller || []);
        setBooks(res.data.books || []);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <>
      <title>📚 Bookstore</title>
      <div className="bg-base-200 min-h-screen">
        {/* Banner */}
        <div
          className="relative h-96 w-full flex items-center justify-center text-center text-white"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1470&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
          }}
        >
          <div className="bg-black bg-opacity-50 p-6 rounded-lg">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Discover Your Next Favorite Book
            </h1>
            <p className="mb-6 text-lg md:text-xl">
              Browse top-rated books and explore amazing stories.
            </p>
            <Link
              to="/shop"
              className="btn btn-primary btn-lg hover:btn-secondary"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Top Rated Books */}
        <div className="px-4 py-8 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Top Rated Books
          </h2>

          {loading ? (
            <p className="text-center mt-10">Loading books...</p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {books.map((book) => (
                  <div
                    key={book._id}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition duration-700"
                  >
                    <figure className="h-60 overflow-hidden">
                      <img
                        src={
                          book.coverImage ||
                          "https://via.placeholder.com/200x250"
                        }
                        alt={book.bookName}
                        className="w-full h-full object-cover hover:scale-125 transition-all hover:rotate-12 duration-300"
                      />
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title text-lg font-semibold">
                        {book.bookName}
                      </h2>
                      <span className="badge badge-primary">
                        ⭐ {book.averageRating.toFixed(1)}
                      </span>
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

              {/* best seller books */}
              {bestSellerBooks.length > 0 && (
                <div className="mt-14">
                  <h2 className="text-3xl font-bold text-center mb-8 text-secondary">
                    🏆 Best Seller Books
                  </h2>

                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {bestSellerBooks.map((item) => {
                      const book = item.book;
                      if (!book) return null;

                      return (
                        <div
                          key={book._id}
                          className="card bg-base-100 shadow-xl hover:shadow-2xl transition duration-700"
                        >
                          <figure className="h-60 overflow-hidden">
                            <img
                              src={
                                book.coverImage ||
                                "https://via.placeholder.com/200x250"
                              }
                              alt={book.bookName}
                              className="w-full h-full object-cover hover:scale-125 transition-all hover:rotate-12 duration-300"
                            />
                          </figure>

                          <div className="card-body">
                            <h2 className="card-title text-lg font-semibold">
                              {book.bookName}
                            </h2>

                            <div className="flex gap-2 flex-wrap">
                              <span className="badge badge-warning">
                                BEST SELLER
                              </span>

                              <span className="badge badge-primary">
                                ⭐ {book.averageRating.toFixed(1)}
                              </span>
                            </div>

                            <div className="card-actions justify-end mt-4">
                              <Link
                                to={`/book/${book._id}`}
                                className="btn btn-outline btn-secondary btn-sm"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
