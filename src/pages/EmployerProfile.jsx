import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setRole } from "../../store/userSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';

import {
  Building,
  Mail,
  Globe,
  MapPin,
  Phone,
  Upload,
  Edit,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  XCircle,
  Briefcase,
} from "lucide-react";

// Yup validation schema for EmployerProfile
const schema = Yup.object().shape({
  company_name: Yup.string()
    .required("Company name is required")
    .max(255, "Company name must be at most 255 characters"),
  company_logo: Yup.mixed()
    .nullable()
    .test("fileType", "Invalid company logo type (jpeg, png, jpg, gif)", (value) => {
      if (!value || value.length === 0) return true;
      if (value[0] && typeof value[0] === "string") return true;
      return ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(value[0]?.type);
    }),
  company_description: Yup.string().nullable(),
  website_url: Yup.string().nullable().url("Invalid URL").max(500, "Website URL must be at most 500 characters"),
  industry: Yup.string().nullable().max(255, "Industry must be at most 255 characters"),
  company_size: Yup.string()
    .nullable()
    .matches(/^\d*$/, "Company size must contain numbers only")
    .max(100, "Company size must be at most 100 characters"),
  location: Yup.string().nullable().max(255, "Location must be at most 255 characters"),
  contact_person_name: Yup.string().nullable().max(255, "Contact person name must be at most 255 characters"),
  contact_email: Yup.string().nullable().email("Invalid email format").max(255, "Contact email must be at most 255 characters"),
  phone_number: Yup.string().nullable().max(20, "Phone number must be at most 20 characters"),
});

const EmployerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editProfile, setEditProfile] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [companyLogoRemoved, setCompanyLogoRemoved] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    companyInfo: true,
    contact: true,
  });

  const BASE_URL = "http://localhost:8000";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const companyLogoWatch = watch("company_logo");
  useEffect(() => {
    if (selectedFile) {
      setPreviewLogo(URL.createObjectURL(selectedFile));
      setCompanyLogoRemoved(false);
    } else if (companyLogoRemoved) {
      setPreviewLogo(null);
    } else {
      setPreviewLogo(profile?.company_logo_url || null);
    }
  }, [selectedFile, companyLogoRemoved, profile?.company_logo_url]);

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValue("company_logo", e.target.files);
      setCompanyLogoRemoved(false);
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access-token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        dispatch(setRole(null));
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/employer-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204 || !response.data) {
        setProfile(null);
        setError("No employer profile data found. Please create your profile.");
      } else {
        const profileData = response.data;
        setProfile(profileData);
        reset(profileData);
        setPreviewLogo(profileData.company_logo_url || null);
        setCompanyLogoRemoved(false);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized. Please log in again.");
        dispatch(setRole(null));
      } else if (err.response && err.response.status === 404) {
        setProfile(null);
        setError("No employer profile data found. Please create your profile.");
      } else {
        setError(`Failed to load profile. ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setEditProfile(false);

    try {
      const token = localStorage.getItem("access-token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const userId = profile?.user_id;
      if (!userId) {
        setError("User ID not found. Please log in again or fetch profile data.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      
      console.log("Submitting data:", data);

      Object.keys(data).forEach(key => {
        if (key !== "company_logo" && data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      if (selectedFile) {
        formData.append("company_logo", selectedFile);
        console.log("Adding file to FormData:", selectedFile.name);
      } else if (companyLogoRemoved) {
        formData.append("company_logo_removed", "true");
        console.log("Marking logo as removed");
      }

      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      console.log(`Sending request to: ${BASE_URL}/api/employer-profiles/${userId}/update`);
      
      const response = await axios.post(
        `${BASE_URL}/api/employer-profiles/${userId}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Update response:", response.data);

      setProfile(response.data.data);
      setPreviewLogo(response.data.data.company_logo_url || null);
      setCompanyLogoRemoved(false);
      setSelectedFile(null);
      setError("");
      reset(response.data.data);
      
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      let errorMessage = "Failed to update profile. Please try again.";
      if (err.response) {
        if (err.response.status === 422 && err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors)
            .flat()
            .join(". ");
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Status: ${err.response.status} - ${err.message}`;
        }
      }
      setError(errorMessage);
      setEditProfile(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditProfile(false);
    reset(profile);
    setPreviewLogo(profile?.company_logo_url || null);
    setCompanyLogoRemoved(false);
    setSelectedFile(null);
  };

  const handleRemoveCompanyLogo = () => {
    setPreviewLogo(null);
    setValue("company_logo", null);
    setCompanyLogoRemoved(true);
    setSelectedFile(null);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePostJob = () => {
    navigate('/payment');
  };

  const handleCreateProfile = () => {
    navigate('/create-employer-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[#d0443c] rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#d0443c] w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading employer profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <p className="text-[#d0443c] text-lg mb-4">{error}</p>
          <button
            onClick={() => {
              if (error.includes("create your profile")) {
                handleCreateProfile();
              } else {
                fetchProfileData();
              }
            }}
            className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#b53c35] transition duration-300 shadow-md"
          >
            {error.includes("create your profile") ? "Create Profile" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {profile || editProfile ? (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative">
                <div className="h-48 bg-gradient-to-r from-[#d0443c] to-[#b53c35]"></div>
                <div className="absolute -bottom-16 left-6">
                  <div className="relative">
                    <div className="w-36 h-36 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                      {previewLogo ? (
                        <img src={previewLogo} alt="Company Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <Building size={72} />
                        </div>
                      )}
                    </div>
                    {editProfile && (
                      <>
                        <label className="absolute bottom-0 right-0 bg-[#d0443c] p-2 rounded-full cursor-pointer shadow-md hover:bg-[#b53c35] transition">
                          <Upload size={16} className="text-white" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg,image/gif"
                            onChange={handleCompanyLogoChange}
                          />
                        </label>
                        {previewLogo && (
                          <button
                            type="button"
                            onClick={handleRemoveCompanyLogo}
                            className="absolute top-0 right-0 bg-red-500 p-1 rounded-full cursor-pointer shadow-md hover:bg-red-700 transition"
                            title="Remove company logo"
                          >
                            <XCircle size={16} className="text-white" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-20 px-6 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    {editProfile ? (
                      <input
                        type="text"
                        {...register("company_name")}
                        className={`w-full text-2xl font-bold px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.company_name ? 'border-[#d0443c]' : 'border-gray-300'}`}
                        placeholder="Company Name"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile?.company_name || "Company Name Not Set"}
                      </h2>
                    )}
                    {errors.company_name && <p className="text-[#d0443c] text-sm mt-1">{errors.company_name.message}</p>}
                    {editProfile ? (
                      <textarea
                        {...register("company_description")}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        placeholder="Tell us about your company..."
                      />
                    ) : (
                      <p className="text-gray-600 mt-2">{profile?.company_description || "No company description provided"}</p>
                    )}
                  </div>
                  {!editProfile && profile && Object.keys(profile).length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditProfile(true)}
                        className="flex items-center gap-2 bg-[#d0443c]/10 text-[#d0443c] px-4 py-2 rounded-lg hover:bg-[#d0443c]/20 transition"
                      >
                        <Edit size={18} />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={handlePostJob}
                        className="flex items-center gap-2 bg-[#d0443c] text-white px-4 py-2 rounded-lg hover:bg-[#b53c35] transition shadow-md"
                      >
                        <Briefcase size={18} />
                        <span>Post Job</span>
                      </button>
                    </div>
                  )}
                </div>
                {!editProfile && profile && Object.keys(profile).length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-4">
                    {profile.industry && (
                      <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                        <Building className="text-[#d0443c] mr-2" size={16} />
                        <span className="text-gray-700">{profile.industry}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                        <MapPin className="text-[#d0443c] mr-2" size={16} />
                        <span className="text-gray-700">{profile.location}</span>
                      </div>
                    )}
                    {profile.company_size && false && (
                      <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                        <User className="text-[#d0443c] mr-2" size={16} />
                        <span className="text-gray-700">{profile.company_size} employees</span>
                      </div>
                    )}
                    {profile.website_url && (
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center bg-gray-50 px-4 py-2 rounded-lg text-[#d0443c] hover:underline"
                      >
                        <Globe className="mr-2" size={16} />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            {(editProfile || !profile) ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Error message for company_logo */}
                {errors.company_logo && (
                  <div className="bg-red-50 border border-red-200 text-[#d0443c] px-4 py-3 rounded-lg mb-2">
                    {errors.company_logo.message}
                  </div>
                )}
                {/* General error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-[#d0443c] px-4 py-3 rounded-lg mb-2">
                    {error}
                  </div>
                )}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleSection("companyInfo")}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Additional Company Information</h3>
                    {expandedSections.companyInfo ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  {expandedSections.companyInfo && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Industry</label>
                        <input
                          type="text"
                          {...register("industry")}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.industry ? 'border-[#d0443c]' : 'border-gray-300'}`}
                        />
                        {errors.industry && <p className="text-[#d0443c] text-sm mt-1">{errors.industry.message}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Company Size</label>
                        <input
                          type="text"
                          {...register("company_size")}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.company_size ? 'border-[#d0443c]' : 'border-gray-300'}`}
                          placeholder="e.g., 1-10, 50-100, 1000+"
                        />
                        {errors.company_size && <p className="text-[#d0443c] text-sm mt-1">{errors.company_size.message}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Location</label>
                        <input
                          type="text"
                          {...register("location")}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.location ? 'border-[#d0443c]' : 'border-gray-300'}`}
                          placeholder="e.g., New York, NY, USA"
                        />
                        {errors.location && <p className="text-[#d0443c] text-sm mt-1">{errors.location.message}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Website URL</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...register("website_url")}
                            className={`flex items-center w-full pl-10 px-5 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.website_url ? 'border-[#d0443c]' : 'border-gray-300'}`}
                          />
                        </div>
                        {errors.website_url && <p className="text-[#d0443c] text-sm mt-1">{errors.website_url.message}</p>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleSection("contact")}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Contact Person Information</h3>
                    {expandedSections.contact ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  {expandedSections.contact && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Contact Person Name<span className="text-[#d0443c]">*</span></label>
                        <input
                          type="text"
                          {...register("contact_person_name")}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.contact_person_name ? 'border-[#d0443c]' : 'border-gray-300'}`}
                        />
                        {errors.contact_person_name && <p className="text-[#d0443c] text-sm mt-1">{errors.contact_person_name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Contact Email<span className="text-[#d0443c]">*</span></label>
                        <input
                          type="text"
                          {...register("contact_email")}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.contact_email ? 'border-[#d0443c]' : 'border-gray-300'}`}
                        />
                        {errors.contact_email && <p className="text-[#d0443c] text-sm mt-1">{errors.contact_email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Phone Number<span className="text-[#d0443c]">*</span></label>
                        <input
                          type="text"
                          {...register("phone_number")}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] ${errors.phone_number ? 'border-[#d0443c]' : 'border-gray-300'}`}
                        />
                        {errors.phone_number && <p className="text-[#d0443c] text-sm mt-1">{errors.phone_number.message}</p>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  {profile && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#b53c35] transition duration-300 shadow-md"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleSection("contact")}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                    {expandedSections.contact ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  {expandedSections.contact && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile?.contact_person_name && (
                        <div className="flex items-center text-gray-700">
                          <User className="text-[#d0443c] mr-2" size={20} />
                          <span>{profile.contact_person_name}</span>
                        </div>
                      )}
                      {profile?.contact_email && (
                        <div className="flex items-center text-gray-700">
                          <Mail className="text-[#d0443c] mr-2" size={20} />
                          <span>{profile.contact_email}</span>
                        </div>
                      )}
                      {profile?.phone_number && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="text-[#d0443c] mr-2" size={20} />
                          <span>{profile.phone_number}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Employer Profile Found</h2>
            <p className="text-gray-600 mb-6">You haven't created your employer profile yet.</p>
            <button
              onClick={handleCreateProfile}
              className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#b53c35] transition font-medium"
            >
              Create Employer Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerProfile;