import React, { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-blue-600">
          CourseApp
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
          <a href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</a>
          <a href="/courses" className="text-gray-700 hover:text-blue-600">Courses</a>
          <a href="/profile" className="text-gray-700 hover:text-blue-600">Profile</a>
        </div>

        {/* Sign In Button (Desktop) */}
        <div className="hidden md:block">
          <a
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {/* Hamburger Icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-3 space-y-2">
          <a href="/" className="block text-gray-700 hover:text-blue-600">Home</a>
          <a href="/dashboard" className="block text-gray-700 hover:text-blue-600">Dashboard</a>
          <a href="/courses" className="block text-gray-700 hover:text-blue-600">Courses</a>
          <a href="/profile" className="block text-gray-700 hover:text-blue-600">Profile</a>
          <a
            href="/login"
            className="block bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


