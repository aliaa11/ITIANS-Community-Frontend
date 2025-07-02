import React from 'react';
import { motion } from 'framer-motion';
import { FiLinkedin, FiGithub, FiExternalLink } from 'react-icons/fi';

const ItianSidebarProfile = ({ profile }) => {
  if (!profile) return null;
  console.log("🧩 Sidebar profile:", profile);


  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Profile Overview</h3>
          <a
            href="/itian-profile"
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            View Full <FiExternalLink className="ml-1" />
          </a>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-4">
        {/* Profile Info */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group mb-3">
            <img
              src={profile.profile_picture_url || `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=random`}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
          
          <h2 className="text-lg font-bold text-gray-800">
            {profile.first_name} {profile.last_name}
          </h2>
          
          {profile.bio && (
            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
              {profile.iti_track}
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2">
          <DetailCard label="Experience" value={`${profile.experience_years || 0} yrs`} />
          <DetailCard label="Track" value={profile.iti_track || '-'} />
          <DetailCard label="Graduation" value={profile.graduation_year || '-'} />
          <DetailCard label="Status" value="Active" />
        </div>

        {/* Skills */}
        <div className="pt-2">
          <SectionTitle>Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.skills?.length > 0 ? (
              profile.skills.map(skill => (
                <SkillBadge key={skill.id} skill={skill.skill_name} />
              ))
            ) : (
              <p className="text-sm text-gray-500">No skills added</p>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="pt-2">
          <SectionTitle>Projects</SectionTitle>
          <ul className="mt-1 space-y-1.5">
            {profile.projects?.length > 0 ? (
              profile.projects.map(project => (
                <ProjectItem 
                  key={project.id} 
                  title={project.project_title} 
                  link={project.project_link} 
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No projects added</p>
            )}
          </ul>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-3 pt-3 mt-3 border-t border-gray-100">
          <SocialLink 
            icon={<FiLinkedin className="text-blue-600" />} 
            url={profile.linkedin_profile_url}
          />
          <SocialLink 
            icon={<FiGithub className="text-gray-800" />} 
            url={profile.github_profile_url}
          />
          <SocialLink 
            icon={<FiExternalLink className="text-green-600" />} 
            url={profile.portfolio_url}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Helper Components
const DetailCard = ({ label, value }) => (
  <div className="bg-gray-50 p-2 rounded-lg">
    <p className="text-xs text-gray-500 font-medium">{label}</p>
    <p className="text-sm font-semibold text-gray-700">{value}</p>
  </div>
);

const SectionTitle = ({ children }) => (
  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
    <span className="w-1 h-3 bg-red-500 mr-2 rounded-full"></span>
    {children}
  </h4>
);

const SkillBadge = ({ skill }) => (
  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs">
    {skill}
  </span>
);

const ProjectItem = ({ title, link }) => (
  <li className="flex items-start">
    <span className="text-red-500 mr-1 mt-1 text-xs">•</span>
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-gray-700 hover:text-red-600 hover:underline flex items-center"
    >
      {title}
      <FiExternalLink className="ml-1" size={10} />
    </a>
  </li>
);

const SocialLink = ({ icon, url }) => (
  <motion.a
    whileHover={{ y: -2 }}
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-gray-100 p-1.5 rounded-full text-sm"
  >
    {icon}
  </motion.a>
);

export default ItianSidebarProfile;