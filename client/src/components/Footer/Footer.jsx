// Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-base-100 border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div className="flex flex-col items-start">
          <Link to="/" className="text-2xl font-bold text-primary mb-2">
            📚 Book Store
          </Link>
          <p className="text-gray-500">
            Explore your favorite books and discover amazing stories.
          </p>

          {/* Social Links */}
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-gray-500 hover:text-primary">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <Link to="/" className="link link-hover mb-1">
            Home
          </Link>
          <Link to="/shop" className="link link-hover mb-1">
            Shop
          </Link>
          <Link to="/contact" className="link link-hover mb-1">
            Contact Us
          </Link>
          <Link to="/signin" className="link link-hover mb-1">
            Sign In
          </Link>
          <Link to="/signup" className="link link-hover">
            Sign Up
          </Link>
        </div>

        {/* Contact / Info */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <p className="text-gray-500 mb-1">Email: info@bookstore.com</p>
          <p className="text-gray-500 mb-1">Phone: +977 98XXXXXXX</p>
          <p className="text-gray-500">Address: Kathmandu, Nepal</p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-base-200 border-t border-gray-200 text-center py-4">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Book Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
