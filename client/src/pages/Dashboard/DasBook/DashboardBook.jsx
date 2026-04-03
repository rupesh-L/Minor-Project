import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const DashboardBook = () => {
  const { books: initialBooks, fetchSummary } = useOutletContext();

  const [books, setBooks] = useState([]);
  const [editingBookId, setEditingBookId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    bookName: "",
    isbnNo: "",
    author: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    isActive: true,
  });

  // 🔁 Reload-safe sync
  useEffect(() => {
    if (!initialBooks || initialBooks.length === 0) {
      fetchSummary();
    } else {
      setBooks(initialBooks);
    }
  }, [initialBooks, fetchSummary]);

  // ✏️ Start editing
  const handleEdit = (book) => {
    setEditingBookId(book._id);
    setImageFile(null);

    setFormData({
      bookName: book.bookName || "",
      isbnNo: book.isbnNo || "",
      author: book.author || "",
      description: book.description || "",
      category: book.category || "",
      price: book.price || "",
      stock: 0, // increment stock
      isActive: book.isActive,
    });
  };

  // 🔄 Input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🖼 Image change
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // 💾 Update book (TEXT + IMAGE)
  const handleUpdate = async (bookId) => {
    try {
      const data = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append image if selected
      if (imageFile) {
        data.append("coverImage", imageFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/v1/book/update/${bookId}`,
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        toast.success("Book updated successfully");
        setEditingBookId(null);
        setImageFile(null);
        fetchSummary(); // single source of truth
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update book");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard/books/add"
          className="btn btn-outline btn-primary hover:scale-105 transition-transform duration-200"
        >
          Add New Book
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Manage Books</h1>

      <div className="overflow-x-auto shadow rounded">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-amber-500 text-white">
            <tr>
              <th className="p-2 border">Book</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Active</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  No books found
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book._id} className="hover:bg-green-600 transition">
                  {/* Book Name */}
                  <td className="p-2 border">
                    {editingBookId === book._id ? (
                      <input
                        name="bookName"
                        value={formData.bookName}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      book.bookName
                    )}
                  </td>

                  {/* Category */}
                  <td className="p-2 border">
                    {editingBookId === book._id ? (
                      <input
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      book.category
                    )}
                  </td>

                  {/* Price */}
                  <td className="p-2 border">
                    {editingBookId === book._id ? (
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="border p-1 w-full"
                      />
                    ) : (
                      `$${book.price}`
                    )}
                  </td>

                  {/* Stock */}
                  <td className="p-2 border">
                    {editingBookId === book._id ? (
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="border p-1 w-full"
                        placeholder="Add stock"
                      />
                    ) : (
                      book.stock
                    )}
                  </td>

                  {/* Active */}
                  <td className="p-2 border text-center">
                    {editingBookId === book._id ? (
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                    ) : book.isActive ? (
                      "Yes"
                    ) : (
                      "No"
                    )}
                  </td>

                  {/* Image */}
                  <td className="p-2 border text-center">
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt="cover"
                        className="w-14 h-20 object-cover mx-auto mb-1"
                      />
                    )}

                    {editingBookId === book._id && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1"
                      />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-2 border space-x-2">
                    {editingBookId === book._id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(book._id)}
                          className="bg-gray-500 w-full text-white px-3 py-1 rounded hover:bg-blue-500 transition cursor-pointer mb-0.5"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingBookId(null)}
                          className="bg-red-600 w-full text-white px-3 py-1 rounded hover:bg-green-500 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(book)}
                        className="bg-blue-600 w-full text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardBook;
