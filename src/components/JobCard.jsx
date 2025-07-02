import "../css/JobCard.css";
import { Link } from "react-router-dom";
import { format } from 'date-fns';

const JobCard = ({ job }) => {

  // Shorten description
  const shortDescription = job.description?.length > 100
    ? `${job.description.substring(0, 100)}...`
    : job.description || 'No description provided';

  // Format date
  const formattedDate = job.posted_date 
    ? format(new Date(job.posted_date), 'MMM dd, yyyy')
    : 'Not specified';

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      EGP: 'E£',
      JPY: '¥',
      CAD: 'CA$',
      AUD: 'A$',
      // Add more currencies as needed
    };
    return symbols[currencyCode] || (currencyCode ? `${currencyCode} ` : '');
  };

  // Format salary with proper currency and number formatting
  const displaySalary = () => {
  const salaryRange = job.salary_range || {};
  const min = parseFloat(salaryRange.min);
  const max = parseFloat(salaryRange.max);
  const currency = getCurrencySymbol(salaryRange.currency || 'EGP');

  if ((!min || min <= 0) && (!max || max <= 0)) {
    return 'Not specified';
  }

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const minFormatted = formatAmount(min);
  const maxFormatted = formatAmount(max);

  if (minFormatted && maxFormatted) {
    return `${currency}${minFormatted} - ${currency}${maxFormatted}`;
  } else if (minFormatted) {
    return `From ${currency}${minFormatted}`;
  } else if (maxFormatted) {
    return `Up to ${currency}${maxFormatted}`;
  }

  return 'Not specified';
};


  return (
    <div className="job-card">
      <div className="job-header">
        <h3>{job.job_title || 'Untitled Position'}</h3>
          {job.employer?.id && (
            <p className="company">
              <Link 
                to={`/employer-profile/${job.employer.id}`} 
                className="text-blue-600 hover:underline"
              >
                {job.employer.name}
              </Link>
            </p>
          )}
      </div>

      <div className="job-details">
        <p><span>Description:</span> {shortDescription}</p>
        <p><span>Qualifications:</span> {job.qualifications || 'Not specified'}</p>
        <p><span>Location:</span> {job.job_location || 'Location not specified'}</p>
        <p><span>Job Type:</span> {job.job_type || 'Not specified'}</p>
        <p><span>Salary:</span> {displaySalary()}</p>
        <p><span>Posted On:</span> {formattedDate}</p>
      </div>

      <div className="job-footer">
        <div className="job-tags">
          {job.work_type === "Work From Home" && (
            <span className="work-type">
              <span className="wfh-icon">🏠</span> Work From Home
            </span>
          )}
        </div>
      </div>

      <div className="view-more">
        <Link to={`/jobs/${job.id}`} className="view-more-btn">
          ... View more <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;