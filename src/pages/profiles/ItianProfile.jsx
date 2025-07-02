import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setRole } from "../../store/userSlice";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Globe,
  Calendar,
  Briefcase,
  MapPin,
  Github,
  Linkedin,
  Award,
  BookOpen,
  Star,
  X,
  Edit,
  Sparkles,
  Upload,
  ChevronDown,
  ChevronUp,
  Link,
  Phone,
  FileText,
} from "lucide-react";

const schema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .max(100, "First name must be at most 100 characters"),
  last_name: Yup.string()
    .required("Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  bio: Yup.string().nullable(),
  iti_track: Yup.string()
    .required("ITI track is required")
    .max(100, "ITI track must be at most 100 characters"),
  graduation_year: Yup.number()
    .required("Graduation year is required")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 5, "Invalid year")
    .typeError("Graduation year must be a number"),
  cv: Yup.mixed().nullable(),
  portfolio_url: Yup.string().url("Invalid URL").nullable(),
  linkedin_profile_url: Yup.string().url("Invalid URL").nullable(),
  github_profile_url: Yup.string().url("Invalid URL").nullable(),
  is_open_to_work: Yup.boolean().required("Availability is required"),
  experience_years: Yup.number()
    .nullable()
    .min(0, "Experience cannot be negative")
    .typeError("Experience years must be a number"),
  current_job_title: Yup.string().nullable().max(255),
  current_company: Yup.string().nullable().max(255),
  preferred_job_locations: Yup.string().nullable().max(500),
  email: Yup.string().email("Invalid email format").nullable().max(255),
  number: Yup.string()
    .nullable()
    .matches(/^\+?[0-9]{7,15}$/, "Invalid phone number format")
    .max(20),
  skills: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().nullable(),
      skill_name: Yup.string().required("Skill name is required").max(100),
    })
  ),
  projects: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().nullable(),
      project_title: Yup.string().required("Project title is required").max(255),
      description: Yup.string().nullable(),
      project_link: Yup.string().url("Invalid URL").nullable(),
    })
  ),
});

const ItianProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editProfile, setEditProfile] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewCv, setPreviewCv] = useState(null);
  const [cvError, setCvError] = useState("");
  const [imageError, setImageError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    contact: true,
    professional: true,
    skills: true,
    projects: true,
  });

  const BASE_URL = "http://localhost:8000";

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      skills: [{ skill_name: "" }],
      projects: [{ project_title: "", description: "", project_link: "" }],
    },
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: "projects",
  });

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

      const response = await axios.get(`${BASE_URL}/api/itian-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204 || !response.data) {
        setProfile(null);
        setError("No profile data found. Please create your profile.");
      } else {
        const profileData = response.data;
        setProfile(profileData);
        reset(profileData);
        setPreviewImage(profileData.profile_picture_url || null);
        setPreviewCv(profileData.cv_url || null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized. Please log in again.");
        dispatch(setRole(null));
      } else if (err.response && err.response.status === 404) {
        setProfile(null);
        setError("No profile data found. Please create your profile.");
      } else {
        setError(
          `Failed to load profile. ${
            err.response?.data?.message || err.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        setImageError("يجب أن تكون الصورة من نوع JPEG, PNG, أو GIF");
        setPreviewImage(null);
        setValue("profile_picture", null);
        return;
      }
      setImageError("");
      setPreviewImage(URL.createObjectURL(file));
      setValue("profile_picture", file);
    } else {
      setPreviewImage(profile?.profile_picture_url || null);
      setValue("profile_picture", null);
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setCvError("CV must be a PDF file.");
        setValue("cv", null);
        setPreviewCv(null);
        return;
      }
      setCvError("");
      setPreviewCv(URL.createObjectURL(file));
      setValue("cv", file);
    } else {
      setPreviewCv(profile?.cv_url || null);
      setValue("cv", null);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setEditProfile(false);

    const formData = new FormData();

    for (const key in data) {
      if (
        key !== "skills" &&
        key !== "projects" &&
        key !== "profile_picture" &&
        key !== "cv"
      ) {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      }
    }

    if (data.profile_picture) {
      formData.append("profile_picture", data.profile_picture);
    }

    data.skills.forEach((skill, index) => {
      if (skill.skill_name && skill.skill_name.trim() !== "") {
        formData.append(
          `skills[${index}][skill_name]`,
          skill.skill_name.trim()
        );
      }
    });

    data.projects.forEach((project, index) => {
      if (project.project_title && project.project_title.trim() !== "") {
        formData.append(
          `projects[${index}][project_title]`,
          project.project_title.trim()
        );
        if (project.description)
          formData.append(
            `projects[${index}][description]`,
            project.description
          );
        if (project.project_link)
          formData.append(
            `projects[${index}][project_link]`,
            project.project_link
          );
      }
    });
    if (data.cv) {
      formData.append("cv", data.cv);
    }

    if (Array.isArray(data.skills)) {
      data.skills.forEach((skill, index) => {
        if (skill.skill_name && skill.skill_name.trim() !== "") {
          if (skill.id) {
            formData.append(`skills[${index}][id]`, skill.id);
          }
          formData.append(`skills[${index}][skill_name]`, skill.skill_name.trim());
        }
      });
    }

    if (Array.isArray(data.projects)) {
      data.projects.forEach((project, index) => {
        if (project.project_title && project.project_title.trim() !== "") {
          if (project.id) {
            formData.append(`projects[${index}][id]`, project.id);
          }
          formData.append(`projects[${index}][project_title]`, project.project_title.trim());
          if (project.description)
            formData.append(`projects[${index}][description]`, project.description);
          if (project.project_link)
            formData.append(`projects[${index}][project_link]`, project.project_link);
        }
      });
    }

    try {
      const token = localStorage.getItem("access-token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const user_id = profile?.user_id;
      const response = await axios.post(
        `${BASE_URL}/api/itian-profiles/${user_id}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message === "Profile updated successfully") {
        setProfile(response.data.data);
        setPreviewImage(response.data.data.profile_picture_url || null);
        setPreviewCv(response.data.data.cv_url || null);
        setError("");
        reset(response.data.data);
      } else {
        setError(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      setError(`Failed to update profile. ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditProfile(false);
    reset(profile);
    setPreviewImage(profile?.profile_picture_url || null);
    setPreviewCv(profile?.cv_url || null);
    setImageError("");
    setCvError("");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCreateProfile = () => {
    navigate('/create-itian-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[#d0443c] rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#d0443c] w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">
          Loading profile...
        </p>
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
            {error.includes("create your profile") ? "Create Itian Profile" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {profile ? (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="relative">
                <div className="h-48 bg-gradient-to-r from-[#d0443c] to-[#b53c35]"></div>

                {/* Profile Picture */}
                <div className="absolute -bottom-16 left-6">
                  <div className="relative">
                    <div className="w-36 h-36 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <User size={72} />
                        </div>
                      )}
                    </div>
                    {editProfile && (
                      <label className="absolute bottom-0 right-0 bg-[#d0443c] p-2 rounded-full cursor-pointer shadow-md hover:bg-[#b53c35] transition">
                        <Upload size={16} className="text-white" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleProfilePictureChange}
                          accept="image/*"
                        />
                      </label>
                    )}
                  </div>
                </div>
                {editProfile && imageError && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-20 w-full text-center">
                    <p className="text-[#d0443c] text-sm bg-white p-1 rounded shadow">
                      {imageError}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-20 px-6 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    {editProfile ? (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <input
                            type="text"
                            {...register("first_name")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            {...register("last_name")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                            placeholder="Last Name"
                          />
                        </div>
                        {errors.first_name && (
                          <p className="text-[#d0443c] text-sm">
                            {errors.first_name.message}
                          </p>
                        )}
                        {errors.last_name && (
                          <p className="text-[#d0443c] text-sm">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </h2>
                        {profile.current_job_title && (
                          <p className="text-gray-600 mt-1">
                            {profile.current_job_title}
                          </p>
                        )}
                      </div>
                    )}
                    {editProfile ? (
                      <textarea
                        {...register("bio")}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-600 mt-2">
                        {profile.bio || "No bio provided"}
                      </p>
                    )}
                  </div>

                  {/* Edit & Show My Posts Buttons */}
                  <div className="flex gap-2">
                    {!editProfile && (
                      <>
                        <button
                          onClick={() => setEditProfile(true)}
                          className="flex items-center gap-2 bg-[#d0443c]/10 text-[#d0443c] px-4 py-2 rounded-lg hover:bg-[#d0443c]/20 transition"
                        >
                          <Edit size={18} />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={() => navigate("/my-posts")}
                          className="flex items-center gap-2 bg-[#d0443c]/10 text-[#d0443c] px-4 py-2 rounded-lg hover:bg-[#d0443c]/20 transition"
                        >
                          <BookOpen size={18} />
                          <span>Show My Posts</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                    <Briefcase className="text-[#d0443c] mr-2" size={16} />
                    <span className="text-gray-700">
                      {profile.iti_track || "ITI Track"}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                    <Calendar className="text-[#d0443c] mr-2" size={16} />
                    <span className="text-gray-700">
                      Graduated {profile.graduation_year || "Year"}
                    </span>
                  </div>
                  {profile.experience_years !== null && (
                    <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                      <Star className="text-[#d0443c] mr-2" size={16} />
                      <span className="text-gray-700">
                        {profile.experience_years} years experience
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {editProfile ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="text"
                          {...register("email")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        />
                        {errors.email && (
                          <p className="text-[#d0443c] text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Phone
                        </label>
                        <input
                          type="text"
                          {...register("number")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        />
                        {errors.number && (
                          <p className="text-[#d0443c] text-sm mt-1">
                            {errors.number.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Portfolio URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Link size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...register("portfolio_url")}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                          />
                        </div>
                        {errors.portfolio_url && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.portfolio_url.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">LinkedIn Profile</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Linkedin size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...register("linkedin_profile_url")}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                          />
                        </div>
                        {errors.linkedin_profile_url && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.linkedin_profile_url.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">GitHub Profile</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Github size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...register("github_profile_url")}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                          />
                        </div>
                        {errors.github_profile_url && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.github_profile_url.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">CV Upload</label>
                        <div className="flex items-center gap-4">
                          {previewCv && (
                            <a
                              href={previewCv}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-[#d0443c] hover:text-[#b53c35] hover:underline flex items-center"
                            >
                              <FileText className="mr-1" size={16} />
                              View Current CV
                            </a>
                          )}
                          <label className="flex-1 cursor-pointer">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Upload size={16} className="text-gray-400" />
                              </div>
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleCvChange}
                                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c] file:hidden"
                              />
                            </div>
                          </label>
                        </div>
                        {(errors.cv || cvError) && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.cv?.message || cvError}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleSection("professional")}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
                    {expandedSections.professional ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  {expandedSections.professional && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          ITI Track
                        </label>
                        <input
                          type="text"
                          {...register("iti_track")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        />
                        {errors.iti_track && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.iti_track.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Graduation Year
                        </label>
                        <input
                          type="text"
                          {...register("graduation_year")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        />
                        {errors.graduation_year && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.graduation_year.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Experience (Years)
                        </label>
                        <input
                          type="text"
                          {...register("experience_years")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        />
                        {errors.experience_years && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.experience_years.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Current Job Title
                        </label>
                        <input
                          type="text"
                          {...register("current_job_title")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        />
                        {errors.current_job_title && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.current_job_title.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Current Company
                        </label>
                        <input
                          type="text"
                          {...register("current_company")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        />
                        {errors.current_company && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.current_company.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Preferred Locations
                        </label>
                        <input
                          type="text"
                          {...register("preferred_job_locations")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                          placeholder="e.g., Cairo, Remote, Alexandria"
                        />
                        {errors.preferred_job_locations && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.preferred_job_locations.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Open to Work
                        </label>
                        <select
                          {...register("is_open_to_work")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                        >
                          <option value="true">Yes, I'm open to work</option>
                          <option value="false">
                            No, I'm not currently looking
                          </option>
                        </select>
                        {errors.is_open_to_work && (
                          <p className="text-[#d0443c] text-sm mt-1">{errors.is_open_to_work.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleSection("skills")}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Skills</h3>
                    {expandedSections.skills ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  {expandedSections.skills && (
                    <div className="px-6 pb-6">
                      <div className="space-y-4">
                        {skillFields.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >
                            <input
                              type="text"
                              {...register(`skills.${index}.skill_name`)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                              placeholder="Skill name"
                            />
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="p-2 text-[#d0443c] hover:text-[#b53c35] transition"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => appendSkill({ skill_name: "" })}
                          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                        >
                          <span>+ Add Skill</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleSection("projects")}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Projects</h3>
                    {expandedSections.projects ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  {expandedSections.projects && (
                    <div className="px-6 pb-6">
                      <div className="space-y-6">
                        {projectFields.map((item, index) => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium text-gray-900">
                                Project {index + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeProject(index)}
                                className="p-2 text-[#d0443c] hover:text-[#b53c35] transition"
                              >
                                <X size={20} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  {...register(
                                    `projects.${index}.project_title`
                                  )}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                                  placeholder="Project title"
                                />
                                {errors.projects?.[index]?.project_title && (
                                  <p className="text-[#d0443c] text-sm mt-1">
                                    {errors.projects[index].project_title.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  Link
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Link size={16} className="text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    {...register(
                                      `projects.${index}.project_link`
                                    )}
                                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                                    placeholder="Project URL"
                                  />
                                </div>
                                {errors.projects?.[index]?.project_link && (
                                  <p className="text-[#d0443c] text-sm mt-1">
                                    {errors.projects[index].project_link.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                  Description
                                </label>
                                <textarea
                                  {...register(`projects.${index}.description`)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-[#d0443c]"
                                  rows={3}
                                  placeholder="Project description"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            appendProject({
                              project_title: "",
                              description: "",
                              project_link: "",
                            })
                          }
                          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                        >
                          <span>+ Add Project</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#b53c35] transition font-medium shadow-md"
                  >
                    Save Changes
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
                      <div className="flex items-center">
                        <Mail className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">Email</p>
                          <p className="text-gray-900">
                            {profile.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">Phone</p>
                          <p className="text-gray-900">
                            {profile.number || "Not provided"}
                          </p>
                        </div>
                      </div>
                      {profile.portfolio_url && (
                        <div className="flex items-center">
                          <Globe className="text-[#d0443c] mr-3" size={20} />
                          <div>
                            <p className="text-gray-500 text-sm">Portfolio</p>
                            <a
                              href={profile.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#d0443c] hover:underline"
                            >
                              {profile.portfolio_url}
                            </a>
                          </div>
                        </div>
                      )}
                      {profile.linkedin_profile_url && (
                        <div className="flex items-center">
                          <Linkedin className="text-[#d0443c] mr-3" size={20} />
                          <div>
                            <p className="text-gray-500 text-sm">LinkedIn</p>
                            <a
                              href={profile.linkedin_profile_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#d0443c] hover:underline"
                            >
                              {profile.linkedin_profile_url}
                            </a>
                          </div>
                        </div>
                      )}
                      {profile.github_profile_url && (
                        <div className="flex items-center">
                          <Github className="text-[#d0443c] mr-3" size={20} />
                          <div>
                            <p className="text-gray-500 text-sm">GitHub</p>
                            <a
                              href={profile.github_profile_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#d0443c] hover:underline"
                            >
                              {profile.github_profile_url}
                            </a>
                          </div>
                        </div>
                      )}
                      {profile.cv_url && (
                        <div className="flex items-center">
                          <FileText className="text-[#d0443c] mr-3" size={20} />
                          <div>
                            <p className="text-gray-500 text-sm">CV</p>
                            <a
                              href={profile.cv_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#d0443c] hover:underline"
                            >
                              View CV
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleSection("professional")}
                  >
                    <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
                    {expandedSections.professional ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  {expandedSections.professional && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <Briefcase className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">ITI Track</p>
                          <p className="text-gray-900">
                            {profile.iti_track || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">
                            Graduation Year
                          </p>
                          <p className="text-gray-900">
                            {profile.graduation_year || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">Experience</p>
                          <p className="text-gray-900">
                            {profile.experience_years !== null
                              ? `${profile.experience_years} years`
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">
                            Current Position
                          </p>
                          <p className="text-gray-900">
                            {profile.current_job_title || "Not provided"}
                            {profile.current_company &&
                              ` at ${profile.current_company}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">
                            Preferred Locations
                          </p>
                          <p className="text-gray-900">
                            {profile.preferred_job_locations || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Sparkles className="text-[#d0443c] mr-3" size={20} />
                        <div>
                          <p className="text-gray-500 text-sm">Job Status</p>
                          <p className="text-gray-900">
                            {profile.is_open_to_work
                              ? "Open to work"
                              : "Not currently looking"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {profile.skills?.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div
                      className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                      onClick={() => toggleSection("skills")}
                    >
                      <h3 className="text-xl font-bold text-gray-900">Skills</h3>
                      {expandedSections.skills ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    {expandedSections.skills && (
                      <div className="px-6 pb-6">
                        <div className="flex flex-wrap gap-3">
                          {profile.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="bg-[#d0443c]/10 text-[#d0443c] px-4 py-2 rounded-full text-sm font-medium"
                            >
                              {skill.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {profile.projects?.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div
                      className="flex justify-between items-center p-6 cursor-pointer border-b border-gray-200"
                      onClick={() => toggleSection("projects")}
                    >
                      <h3 className="text-xl font-bold text-gray-900">Projects</h3>
                      {expandedSections.projects ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    {expandedSections.projects && (
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {profile.projects.map((project) => (
                            <div
                              key={project.id}
                              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                            >
                              <h4 className="text-lg font-bold text-gray-900 mb-2">{project.project_title}</h4>
                              {project.description && <p className="text-gray-600 mb-4">{project.description}</p>}
                              {project.project_link && (
                                <a
                                  href={project.project_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-[#d0443c] hover:underline"
                                >
                                  <Link className="mr-1" size={16} />
                                  View Project
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Profile Found
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't created your profile yet.
            </p>
            <button
              onClick={handleCreateProfile}
              className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#b53c35] transition font-medium"
            >
              Create Itian Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItianProfile;