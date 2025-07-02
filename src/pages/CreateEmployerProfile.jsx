import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Building, Mail, Globe, MapPin, Upload, X, Sparkles, User as UserIcon } from "lucide-react";

const schema = Yup.object().shape({
  company_name: Yup.string()
    .required("Company name is required")
    .max(255, "Company name must be at most 255 characters"),
  company_logo: Yup.mixed()
    .nullable()
    .test("fileSize", "Company logo is too large (max 2MB)", (value) => {
      if (!value || !value[0]) return true;
      return value[0].size <= 2048 * 1024;
    })
    .test("fileType", "Invalid company logo type (jpeg, png, jpg, gif)", (value) => {
      if (!value || !value[0]) return true;
      return ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(value[0].type);
    }),
  company_description: Yup.string().nullable(),
  website_url: Yup.string()
    .nullable()
    .url("Website URL must be a valid URL")
    .max(500, "Website URL must be at most 500 characters"),
  industry: Yup.string().nullable().max(255, "Industry must be at most 255 characters"),
  company_size: Yup.string()
    .nullable()
    .notRequired()
    .matches(/^\d*$/, "Company size must contain numbers only")
    .max(100, "Company size must be at most 100 characters"),
  location: Yup.string().nullable().max(255, "Location must be at most 255 characters"),
  contact_person_name: Yup.string()
    .nullable()
    .max(255, "Contact person name must be at most 255 characters"),
  contact_email: Yup.string()
    .nullable()
    .email("Contact email must be a valid email address")
    .max(255, "Contact email must be at most 255 characters"),
  phone_number: Yup.string().nullable().max(20, "Phone number must be at most 20 characters"),
});

const CreateEmployerProfile = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      company_name: "",
      company_description: "",
      website_url: "",
      industry: "",
      company_size: "",
      location: "",
      contact_person_name: "",
      contact_email: "",
      phone_number: "",
    },
  });
  
  const [previewLogo, setPreviewLogo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access-token");
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const companyLogoFile = watch("company_logo");
  useEffect(() => {
    if (companyLogoFile && companyLogoFile[0]) {
      setPreviewLogo(URL.createObjectURL(companyLogoFile[0]));
    } else {
      setPreviewLogo(null);
    }
  }, [companyLogoFile]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access-token");
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "company_logo") {
        if (data[key] && data[key][0]) {
          formData.append(key, data[key][0]);
        }
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      const response = await axios.post("http://localhost:8000/api/employer-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      localStorage.setItem("employerProfileCreated", "true");
      navigate("/employer-profile");
    } catch (err) {
      let errorMsg = "Failed to create employer profile. Please try again.";
      if (err.response) {
        if (err.response.status === 409) {
          errorMsg = "Employer profile already exists.";
          localStorage.setItem("employerProfileCreated", "true");
          navigate("/employer-profile");
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data?.errors) {
          const backendErrors = err.response.data.errors;
          errorMsg = Object.values(backendErrors).flat().join(", ");
        }
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
          </div>
          <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">
            Loading employer profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="bg-red-50 border-l-8 border-red-600 p-8 rounded-xl shadow-lg flex items-center">
          <div className="bg-red-600 rounded-full p-2 mr-4">
            <X className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-red-600 font-bold text-lg">Error</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#d0443c] to-[#a83232] rounded-2xl shadow-lg mb-10 overflow-hidden">
          <div className="p-8 flex items-center">
            <Building className="w-8 h-8 text-white mr-4" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
              Create Employer Profile
            </h1>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-lg border border-gray-300 p-8 space-y-8"
        >
          {/* Company Information Section */}
          <div>
            <h4 className="text-2xl font-bold text-[#d0443c] mb-6 flex items-center">
              <Building className="w-6 h-6 text-[#d0443c] mr-3" />
              Company Information
            </h4>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("company_name")}
                  className={`w-full px-4 py-3 border-2 ${errors.company_name ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                  placeholder="Enter company name"
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
                )}
              </div>

              {/* Company Description */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Company Description
                </label>
                <textarea
                  {...register("company_description")}
                  rows={4}
                  className={`w-full px-4 py-3 border-2 ${errors.company_description ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                  placeholder="Enter company description"
                />
                {errors.company_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_description.message}</p>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("website_url")}
                    className={`w-full pl-10 px-4 py-3 border-2 ${errors.website_url ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                    placeholder="Enter website URL"
                  />
                </div>
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.website_url.message}</p>
                )}
              </div>

              {/* Industry and Company Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    {...register("industry")}
                    className={`w-full px-4 py-3 border-2 ${errors.industry ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                    placeholder="Enter industry"
                  />
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Company Size
                  </label>
                  <input
                    type="text"
                    {...register("company_size")}
                    className={`w-full px-4 py-3 border-2 ${errors.company_size ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                    placeholder="Enter company size"
                  />
                  {errors.company_size && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_size.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("location")}
                    className={`w-full pl-10 px-4 py-3 border-2 ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                    placeholder="Enter location"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Company Logo
                </label>
                {previewLogo && (
                  <div className="mb-4">
                    <img
                      src={previewLogo}
                      alt="Logo preview"
                      className="w-32 h-32 object-contain rounded-lg border-4 border-gray-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full border-2 border-dashed border-gray-300 hover:border-[#d0443c] rounded-lg cursor-pointer transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                    </div>
                    <input
                      type="file"
                      {...register("company_logo")}
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                    />
                  </label>
                </div>
                {errors.company_logo && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_logo.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Person Information Section */}
          <div>
            <h4 className="text-2xl font-bold text-[#d0443c] mb-6 flex items-center">
              <UserIcon className="w-6 h-6 text-[#d0443c] mr-3" />
              Contact Person Information
            </h4>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Contact Person Name */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  {...register("contact_person_name")}
                  className={`w-full px-4 py-3 border-2 ${errors.contact_person_name ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                  placeholder="Enter contact person name"
                />
                {errors.contact_person_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_person_name.message}</p>
                )}
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("contact_email")}
                    className={`w-full pl-10 px-4 py-3 border-2 ${errors.contact_email ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                    placeholder="Enter contact email"
                  />
                </div>
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  {...register("phone_number")}
                  className={`w-full px-4 py-3 border-2 ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg text-base transition-all focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50`}
                  placeholder="Enter phone number"
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-bold text-white flex items-center space-x-2 transition-all ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#d0443c] hover:bg-[#a83232] transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Building className="w-5 h-5" />
                  <span>Create Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployerProfile;