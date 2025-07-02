import { Link } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";
import "../css/Navbar.css";

function WithoutLoginNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className="navbar">
        <div className="logo-container">
          <img src="public/logo.png" alt="Logo" className="logo-img" />
          <div className="logo-text">
            <Link to="/">ITIAN</Link>
          </div>
        </div>

        <div className={`menu ${isOpen ? "open" : ""}`}>          
          <Link to="/login" className="nav-link login-btn">
            <FaSignInAlt className="nav-icon" /> Login
          </Link>
        </div>

        <button className="toggle-btn" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>
      <div className="navbar-spacer"></div>
    </>
  );
}

export default WithoutLoginNavbar;