import { Link } from 'react-router-dom';
import './Register.css'; // Import the shared CSS

const EmailVerifiedSuccess = () => {
  return (
    <div className="register-root">
      <div className="register-left">
        <div className="register-container" style={{ textAlign: 'center' }}>
          <div className="register-header">
            <h2 className="register-title" style={{ color: '#28a745' }}>Email Verified!</h2>
          </div>
          <p className="mb-6 text-gray-700">
            Thank you! Your email has been verified. Your registration is now pending review by an administrator. We will notify you by email once your account is approved.
          </p>
          <Link
            to="/login"
            className="register-button" // Use the same button style
          >
            Go to Login
          </Link>
        </div>
      </div>
      <div className="register-hero">
        <div className="register-hero-bg1" />
        <div className="register-hero-bg2" />
        <div className="register-hero-content">
          <h1 className="register-hero-title">Welcome to the Community!</h1>
          <p className="register-hero-desc">Your journey to connect with top talent and exciting opportunities starts now.</p>
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

export default EmailVerifiedSuccess;