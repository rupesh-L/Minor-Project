import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [bookData, setBookData] = useState({
    bookName: "",
    isbnNo: "",
    author: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });

  const [coverImage, setCoverImage] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    const { bookName, isbnNo, author, description, category, price, stock } =
      bookData;

    if (
      !bookName ||
      !isbnNo ||
      !author ||
      !description ||
      !category ||
      !price ||
      !stock
    ) {
      return toast.error("Please fill all required fields");
    }

    if (price <= 0) return toast.error("Price must be greater than zero");
    if (stock <= 0) return toast.error("Stock must be greater than zero");

    try {
      setLoading(true);

      const formData = new FormData();
      Object.keys(bookData).forEach((key) => {
        formData.append(key, bookData[key]);
      });

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const res = await axios.post(
        "http://localhost:5000/api/v1/book/create",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res?.data?.success) {
        toast.success("Book created successfully");
        navigate("/dashboard/books"); // Go back to books dashboard
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto bg-base-100 p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Add New Book</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="bookName"
            placeholder="Book Name"
            className="input input-bordered w-full"
            value={bookData.bookName}
            onChange={handleChange}
          />

          <input
            name="isbnNo"
            placeholder="ISBN Number"
            className="input input-bordered w-full"
            value={bookData.isbnNo}
            onChange={handleChange}
          />

          <input
            name="author"
            placeholder="Author"
            className="input input-bordered w-full"
            value={bookData.author}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Description"
            className="textarea textarea-bordered w-full"
            value={bookData.description}
            onChange={handleChange}
          />

          <input
            name="category"
            placeholder="Category"
            className="input input-bordered w-full"
            value={bookData.category}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            className="input input-bordered w-full"
            value={bookData.price}
            onChange={handleChange}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            className="input input-bordered w-full"
            value={bookData.stock}
            onChange={handleChange}
          />

          <input
            type="file"
            name="coverImage"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
          />

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Add Book"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
