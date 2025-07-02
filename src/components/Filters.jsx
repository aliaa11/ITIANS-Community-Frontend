import React, { useState, useEffect } from "react";
import "../css/Filters.css";

const Filters = ({ currentFilters, onFilter }) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      job_type: '',
      status: '',
      job_location: '',
      min_salary: '',
      max_salary: '',
    };
    setLocalFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const jobTypes = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Freelance', label: 'Freelance' }
  ];

  const statuses = [
    { value: 'Open', label: 'Open' },
   
    { value: 'Closed', label: 'Closed' }
  ];

  const locations = [
    { value: 'on-site', label: 'On-site' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' }
  ];

  return (
    <div className="filters-container">
      <h3 className="filters-title">Filter Jobs</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Job Type</label>
            <select
              name="job_type"
              className="filter-input"
              value={localFilters.job_type}
              onChange={handleChange}
            >
              <option value="">All Types</option>
              {jobTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              className="filter-input"
              value={localFilters.status}
              onChange={handleChange}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select
              name="job_location"
              className="filter-input"
              value={localFilters.job_location}
              onChange={handleChange}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button type="submit" className="apply-btnn">
            Apply
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default Filters;