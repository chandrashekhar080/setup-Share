import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Share2Care from "../../public/Images/logo-Share2Care.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="flex justify-center items-center w-48">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center hover:opacity-90 transition-opacity text-start"
          >
            <img
              src={Share2Care}
              alt="Share2Care"
              className="max-lg:w-36 max-w-52 max-h-12"
            />
          </Link>
        </div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-white bg-gray-700 p-3 rounded-xl">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
