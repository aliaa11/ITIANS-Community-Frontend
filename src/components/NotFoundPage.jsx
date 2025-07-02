import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white px-4 py-12">
      <div className="text-8xl font-extrabold text-[#e35d5b] drop-shadow-lg mb-4">404</div>
      <h1 className="text-3xl md:text-4xl font-bold text-[#b53c35] mb-2">Page Not Found</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Sorry, the page you are looking for does not exist, was moved, or is temporarily unavailable.
      </p>
      {/* <Link
        to="/"
        className="px-6 py-3 bg-[#e35d5b] text-white rounded-lg font-semibold text-lg shadow-md hover:bg-[#b53c35] transition-colors duration-150"
      >
        ← Back to Home
      </Link> */}
    </div>
  );
};

export default NotFoundPage;
