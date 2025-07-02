import React from 'react';

const StatCard = ({ label, value, icon, color = 'bg-red-100', textColor = 'text-red-700' }) => (
  <div className={`flex items-center gap-4 p-4 rounded-lg shadow-sm ${color} border border-gray-200 min-w-[160px]`}>
    {icon && <div className={`text-2xl ${textColor}`}>{icon}</div>}
    <div>
      <div className={`text-lg font-bold ${textColor}`}>{value}</div>
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
    </div>
  </div>
);

export default StatCard;
