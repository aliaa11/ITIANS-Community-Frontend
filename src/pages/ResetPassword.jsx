import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const email = query.get('email');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Please try again."
      );
    }
  };

  return (
    <div className="register-root">
      <div className="register-container" style={{ maxWidth: 400, margin: "auto", marginTop: 60 }}>
        <h2 className="register-title">Reset Password</h2>
        {error && <div className="input-error" style={{ marginBottom: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="register-field">
            <label className="register-label">New Password</label>
            <input
              type="password"
              className="register-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="register-field">
            <label className="register-label">Confirm Password</label>
            <input
              type="password"
              className="register-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="register-button" style={{ width: "100%" }}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
