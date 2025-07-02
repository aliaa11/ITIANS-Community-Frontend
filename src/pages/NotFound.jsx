import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './NotFound.module.css';

const NotFound = () => {
  const user = useSelector((state) => state.user);

  const homePath = useMemo(() => {
    let role = user?.role;
    console.log('--- 404 Page Home Path Logic ---');
    console.log('1. Role from Redux state:', role);

    // Fallback to localStorage if not in Redux state
    if (!role) {
      try {
        const storedUserJSON = localStorage.getItem('user');
        console.log('2. User data string from localStorage:', storedUserJSON);
        if (storedUserJSON) {
          const storedUser = JSON.parse(storedUserJSON);
          role = storedUser?.role;
          console.log('3. Parsed role from localStorage:', role);
        } else {
          console.log('2a. No user data found in localStorage.');
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        console.log('3. Error parsing user from localStorage.');
      }
    }

    let path;
    switch (role) {
      case 'admin':
        path = '/admin';
        break;
      case 'employer':
        path = '/employer';
        break;
      case 'itian':
        path = '/itian';
        break;
      default:
        path = '/';
        break;
    }
    console.log(`4. Final determined role: "${role}". Redirecting to: "${path}"`);
    console.log('---------------------------------');
    return path;
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 relative">
      {/* Floating icons for visual interest */}
      <span className={styles['notfound-floater']} style={{'--x': '10%', '--y': '15%', '--delay': '0s'}}>🌥️</span>
      <span className={styles['notfound-floater']} style={{'--x': '80%', '--y': '10%', '--delay': '2s'}}>✨</span>
      <span className={styles['notfound-floater']} style={{'--x': '20%', '--y': '80%', '--delay': '4s'}}>💫</span>
      <div className={styles['notfound-spotlight']} />
      <div className="flex flex-col items-center z-10">
        <div className={styles['notfound-ghost-container']}>
          {/* Ghost SVG illustration */}
          <svg className={styles['notfound-ghost']} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="70" rx="38" ry="32" fill="#fff" stroke="#e35d5b" strokeWidth="4" />
            <ellipse cx="45" cy="70" rx="5" ry="8" fill="#e35d5b" opacity="0.18" />
            <ellipse cx="75" cy="70" rx="5" ry="8" fill="#e35d5b" opacity="0.18" />
            <circle cx="50" cy="60" r="6" fill="#e35d5b" />
            <circle cx="70" cy="60" r="6" fill="#e35d5b" />
            <ellipse cx="60" cy="90" rx="12" ry="4" fill="#e35d5b" opacity="0.12" />
            <text x="50%" y="40%" textAnchor="middle" fill="#e35d5b" fontSize="40" fontWeight="bold" dy=".3em">404</text>
          </svg>
          <div className={styles['notfound-shadow']} />
        </div>
        <h1 className="text-4xl font-extrabold text-red-600 mb-2 drop-shadow-lg">Page Not Found</h1>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
          Oops! The page you are looking for does not exist or has been moved.<br />
        </p>
        <Link to={homePath} className={styles['notfound-btn-secondary']}>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
