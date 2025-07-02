import React from 'react';

const LoaderOverlay = ({ text = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: { container: 'p-4', spinner: 'h-6 w-6', text: 'text-sm' },
    md: { container: 'p-6', spinner: 'h-8 w-8', text: 'text-base' },
    lg: { container: 'p-8', spinner: 'h-10 w-10', text: 'text-lg' }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`bg-white/90 rounded-lg shadow-lg flex flex-col items-center pointer-events-auto ${sizes[size].container}`}>
        <svg 
          className={`animate-spin ${sizes[size].spinner} text-red-600 mb-2`}
          // ... rest of svg props
        >
          {/* ... svg content */}
        </svg>
        <span className={`text-red-600 font-semibold ${sizes[size].text}`}>{text}</span>
      </div>
    </div>
  );
};

export default LoaderOverlay;
