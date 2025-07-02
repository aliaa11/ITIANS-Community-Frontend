import { Link } from 'react-router-dom';
import './Register.css'; // Import the shared CSS

const EmailVerificationFailed = () => {
  return (
    <div className="register-root">
      <div className="register-left">
        <div className="register-container" style={{ textAlign: 'center' }}>
          <div className="register-header">
            <h2 className="register-title" style={{ color: '#dc3545' }}>Email Verification Failed</h2>
          </div>
          <p className="mb-6 text-gray-700">
          Email verification failed. The link may be invalid or has expired. Please try registering again or contact support if the problem persists.
          </p>
          <Link
            to="/register"
            className="register-button" // Use the same button style
          >
            Try Registering Again
          </Link>
        </div>
      </div>
      <div className="register-hero">
        <div className="register-hero-bg1" />
        <div className="register-hero-bg2" />
        <div className="register-hero-content">
          <h1 className="register-hero-title">Let's Get This Sorted</h1>
          <p className="register-hero-desc">We'll help you get back on track to joining our community.</p>
          <div className="register-hero-people">
            <div className="register-hero-person">👨‍💼</div>
            <div className="register-hero-person">👩‍💻</div>
            <div className="register-hero-person">👨‍🎓</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationFailed;