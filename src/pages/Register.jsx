import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "./Register.css";
import apiClient from "../api/axios";


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    uuid:"",
    password_confirmation: "",
    role: "",
    certificate: null,
    company_brief: ""
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, certificate: file }));
  };

  function validateUserData(userData) {
    const errors = {};
    if (!userData.name || typeof userData.name !== 'string' || userData.name.trim() === '') {
      errors.name = 'Name is required.';
    } else if (userData.name.length > 255) {
      errors.name = 'Name must not exceed 255 characters.';
    }
    if (!userData.email || typeof userData.email !== 'string' || userData.email.trim() === '') {
      errors.email = 'Email is required.';
    } else if (/.+@.+\..+/.test(userData.email) === false) {
      errors.email = 'Email must be a valid email address.';
    }
    if (!userData.password || typeof userData.password !== 'string') {
      errors.password = 'Password is required.';
    } else if (userData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (userData.password !== userData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match.';
    }
    const allowedRoles = ['admin', 'itian', 'employer'];
    if (!userData.role || !allowedRoles.includes(userData.role)) {
      errors.role = 'Role is required and must be admin, itian, or employer.';
    }
    if (userData.role === 'itian') {
      if (!userData.certificate) {
        errors.certificate = 'Certificate is required for ITIAN role.';
      } else {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(userData.certificate.type)) {
          errors.certificate = 'Certificate must be a PDF, JPG, or PNG file.';
        }
        if (userData.certificate.size > 2 * 1024 * 1024) {
          errors.certificate = 'Certificate must not exceed 2MB.';
        }
      }
    } else if (userData.certificate) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(userData.certificate.type)) {
        errors.certificate = 'Certificate must be a PDF, JPG, or PNG file.';
      }
      if (userData.certificate.size > 2 * 1024 * 1024) {
        errors.certificate = 'Certificate must not exceed 2MB.';
      }
    }
    if (userData.role === 'employer') {
      if (!userData.company_brief || userData.company_brief.trim().length < 10) {
        errors.company_brief = 'Company info is required and should be at least 10 characters.';
      }
    }
    return errors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserData(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    // Prepare form data for API
    const apiData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") apiData.append(key, value);
    });
    try {
      const response = await apiClient.post('/api/register', apiData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Registration successful!', response);
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'Your registration was submitted. Please wait for admin approval before logging in.',
        confirmButtonColor: '#e35d5b',
      });
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.log('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border-2 border-black p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-2">Register</h2>
          </div>
          <form onSubmit={handleSubmit} method="post" encType="multipart/form-data" className="space-y-5">
            <div>
              <label htmlFor="name" className="block mb-1 font-semibold text-black">Name</label>
              <input type="text" id="name" name="name" className="w-full px-4 py-2 border-2 border-black rounded-lg focus:border-red-500 bg-white text-black" placeholder="Name" onChange={handleInputChange} />
              {errors.name && <div className="text-red-600 bg-red-50 border border-red-400 rounded mt-1 px-2 py-1 text-sm">{errors.name}</div>}
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 font-semibold text-black">Email</label>
              <input type="text" id="email" name="email" className="w-full px-4 py-2 border-2 border-black rounded-lg focus:border-red-500 bg-white text-black" placeholder="Email" onChange={handleInputChange} />
              {errors.email && <div className="text-red-600 bg-red-50 border border-red-400 rounded mt-1 px-2 py-1 text-sm">{errors.email}</div>}
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 font-semibold text-black">Password</label>
              <input type="password" id="password" name="password" className="w-full px-4 py-2 border-2 border-black rounded-lg focus:border-red-500 bg-white text-black" placeholder="Password" onChange={handleInputChange} />
              {errors.password && <div className="text-red-600 bg-red-50 border border-red-400 rounded mt-1 px-2 py-1 text-sm">{errors.password}</div>}
            </div>
            <div>
              <label htmlFor="password_confirmation" className="block mb-1 font-semibold text-black">Confirm Password</label>
              <input type="password" id="password_confirmation" name="password_confirmation" className="w-full px-4 py-2 border-2 border-black rounded-lg focus:border-red-500 bg-white text-black" placeholder="Confirm Password" onChange={handleInputChange} />
              {errors.password_confirmation && <div className="text-red-600 bg-red-50 border border-red-400 rounded mt-1 px-2 py-1 text-sm">{errors.password_confirmation}</div>}
            </div>
            <div>
              <label htmlFor="role" className="block mb-1 font-semibold text-black">Role</label>
              <select id="role" name="role" className="w-full px-4 py-2 border-2 border-black rounded-lg focus:border-red-500 bg-white text-black" value={formData.role} onChange={handleInputChange}>
                <option value="" disabled>Select Role</option>
                <option value="itian">ITIAN</option>
                <option value="employer">Employer</option>
              </select>
              {errors.role && <div className="text-red-600 bg-red-50 border border-red-400 rounded mt-1 px-2 py-1 text-sm">{errors.role}</div>}
            </div>
            {formData.role === 'itian' && (
              <div>
                <label htmlFor="certificate" className="block mb-1 font-semibold text-black">Certificate</label>
                <input type="file" id="certificate" name="certificate" className="w-full px-4 py-2 border-2 border-black rounded-lg focus:border-red-500 bg-white text-black" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} />
                {errors.certificate && <div className="text-red-600 bg-red-50 border border-red-400 rounded mt-1 px-2 py-1 text-sm">{errors.certificate}</div>}
              </div>
            )}
            {formData.role === 'employer' && (
              <div>
                <label htmlFor="company_brief" className="block mb-1 font-semibold text-black">Company Info / Brief</label>
                <textarea
                  id="company_brief"
                  name="company_brief"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:border-red-500 bg-white text-black"
                  placeholder="Tell us about your company, what you do, and your mission..."
                  value={formData.company_brief}
                  onChange={handleInputChange}
                  rows={4}
                />
                {errors.company_brief && <div className="text-red-600 bg-red-50 border border-red-400 rounded mt-1 px-2 py-1 text-sm">{errors.company_brief}</div>}
              </div>
            )}
            <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition">Register</button>
          </form>
          <div className="text-center mt-4">
            <Link to="/login" className="text-red-600 font-semibold hover:underline">Already have an account? Login</Link>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-white to-red-100 p-8">
        <div className="max-w-lg text-center">
          {formData.role === 'employer' ? (
            <>
              <h1 className="text-3xl font-bold text-red-700 mb-4">Find the Best ITIANs for Your Company</h1>
              <p className="text-lg text-red-800 mb-8">Register as an employer to connect with top IT talents and grow your business with the right people.</p>
              <div className="flex justify-center gap-6 mt-8">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-200 text-3xl border-2 border-red-400">🏢</div>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-200 text-3xl border-2 border-red-400">🤝</div>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-200 text-3xl border-2 border-red-400">💼</div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-red-700 mb-4">Become a part of our ever-growing community.</h1>
              <p className="text-lg text-red-800 mb-8">Join now to connect with both companies and students through our powerful platform.</p>
              <div className="flex justify-center gap-6 mt-8">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-200 text-3xl border-2 border-red-400">👨‍💼</div>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-200 text-3xl border-2 border-red-400">👩‍💻</div>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-200 text-3xl border-2 border-red-400">👨‍🎓</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;