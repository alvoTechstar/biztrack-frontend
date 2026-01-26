import React from 'react';
export default function StatsCard({ title, value, change, icon, color }) {
    const colors = {
      blue: 'from-blue-50 to-blue-100 text-blue-600',
      green: 'from-green-50 to-green-100 text-green-600',
    };
  
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className={`bg-gradient-to-r ${colors[color]} px-5 py-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-gray-700 font-medium">{title}</h3>
            <div className={colors[color]}>{icon}</div>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <span className="ml-2 text-sm font-medium text-green-600">{change}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Compared to yesterday</p>
        </div>
      </div>
    );
  }
  