// Contact.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can send data to backend or email service
    console.log(formData);
    toast.success("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 py-12 flex justify-center">
      <div className="card w-full max-w-lg bg-base-100 shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Contact Us
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Message</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              className="textarea textarea-bordered w-full"
              rows={5}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Send Message
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          <p>Or reach us at:</p>
          <p>Email: support@bookstore.com</p>
          <p>Phone: +1 234 567 8900</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
