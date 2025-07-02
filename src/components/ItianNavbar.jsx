import { Link } from "react-router-dom";
import { useState } from "react";
import { FaHome, FaUser, FaBriefcase, FaFileAlt, FaBars, FaTimes, FaSignOutAlt, FaExclamationTriangle } from "react-icons/fa";
import useLogout from '../hooks/useLogout'; // Import the custom logout hook
import "../css/Navbar.css";
import Notifications from "./Notification";
import MessageNotification from "./MessageNotification";
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../contexts/TranslationContext';

function ItianNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'jobs', 'reports', or null
  const { t } = useTranslation();
  const handleLogout = useLogout(); // Use the custom logout hook

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(prev => (prev === dropdownName ? null : dropdownName));
  };

  // Close menus when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo.png" alt="Logo" className="logo-img " />
          <div className="logo-text">
            <Link to="/itian" onClick={handleLinkClick}>ITIAN</Link>
          </div>
        </div>

        <div className={`menu ${isMobileMenuOpen ? "open" : ""}`}>
           <Link to="/itian" className="nav-link" onClick={handleLinkClick}>
            <FaHome className="nav-icon" /> {t('navbar.home') || 'Home'}
          </Link>
          <Link to="/posts" className="nav-link" onClick={handleLinkClick}>
            <FaFileAlt className="nav-icon" /> {t('navbar.posts') || 'Posts'}
          </Link>
          <Link to="/itian-profile" className="nav-link" onClick={handleLinkClick}>
            <FaUser className="nav-icon" /> {t('navbar.profile') || 'My Profile'}
          </Link>
          
          <Link to="/itian/mychat" className="nav-link" onClick={handleLinkClick}>
            <MessageNotification iconClassName="nav-icon" /> {t('navbar.chat') || 'Chat'}
          </Link>
          
          <div className={`dropdown ${openDropdown === 'jobs' ? 'open' : ''}`}>
            <button className="dropbtn" onClick={() => toggleDropdown('jobs')}>
              <FaBriefcase className="nav-icon" /> {t('navbar.jobs') || 'Jobs'}
            </button>
            {openDropdown === 'jobs' && (
              <div className="dropdown-content">
                <Link to="/jobs" onClick={handleLinkClick}><FaFileAlt className="dropdown-icon" /> {t('navbar.allJobs') || 'All Jobs'}</Link>
                <Link to="/my-applications" onClick={handleLinkClick}><FaFileAlt className="dropdown-icon" /> {t('navbar.myApplications') || 'My Applications'}</Link>
              </div>
            )}
          </div>

          <div className={`dropdown ${openDropdown === 'reports' ? 'open' : ''}`}>
            <button className="dropbtn" onClick={() => toggleDropdown('reports')}>
              <FaExclamationTriangle className="nav-icon" /> {t('navbar.reports') || 'Reports'}
            </button>
            {openDropdown === 'reports' && (
              <div className="dropdown-content">
                <Link to="/itian/reports/create" onClick={handleLinkClick}><FaFileAlt className="dropdown-icon" /> {t('navbar.createReport') || 'Create Report'}</Link>
                <Link to="/itian/my-reports" onClick={handleLinkClick}><FaFileAlt className="dropdown-icon" /> {t('navbar.myReports') || 'My Reports'}</Link>
              </div>
            )}
          </div>

          <div className="notification-wrapper">
            <Notifications />
          </div>

          {/* إضافة Language Switcher */}
          <div className="language-switcher-wrapper">
            <LanguageSwitcher className="navbar-language-switcher" />
          </div>

          <button className="nav-link logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" /> {t('navbar.logout') || 'Logout'}
          </button>
        </div>

        <button className="toggle-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>
      <div className="navbar-spacer"></div>
    </>
  );
}

export default ItianNavbar;