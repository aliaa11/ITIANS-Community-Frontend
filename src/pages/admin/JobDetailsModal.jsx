import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JobDetailsModal = ({ jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`http://127.0.0.1:8000/api/jobs/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access-token')}`
        }
      }
    )
      .then(res => {
        setJob(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load job details.');
        setLoading(false);
      });
  }, [jobId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-gray-200/10">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-red-700">Job Details</h2>
        <div className="text-gray-700">
          {loading && (
            <div className="flex flex-col items-center py-8">
              <svg className="animate-spin h-8 w-8 text-red-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <div>Loading...</div>
            </div>
          )}
          {error && <div className="text-center text-red-500 py-8">{error}</div>}
          {job && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{job.job_title}</h3>
              <p className="mb-2"><span className="font-semibold">Employer:</span> {job.employer?.name}</p>
              <p className="mb-2"><span className="font-semibold">Location:</span> {job.job_location}</p>
              <p className="mb-2"><span className="font-semibold">Type:</span> {job.job_type}</p>
              <p className="mb-2"><span className="font-semibold">Status:</span> {job.status}</p>
              <p className="mb-2"><span className="font-semibold">Posted:</span> {job.posted_date ? new Date(job.posted_date).toLocaleString() : '-'}</p>
              <p className="mb-2"><span className="font-semibold">Views:</span> {job.views_count}</p>
              <p className="mb-2 break-words whitespace-pre-line max-w-full overflow-x-auto"><span className="font-semibold">Description:</span> {job.description}</p>
              <p className="mb-2"><span className="font-semibold">Requirements:</span> {job.requirements}</p>
              <p className="mb-2"><span className="font-semibold">Qualifications:</span> {job.qualifications}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
