import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-950 shadow-md sticky top-0 z-50">
          <button className="md:hidden p-2 text-gray-700 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        
    </nav>
  );
};

export default Navbar;
