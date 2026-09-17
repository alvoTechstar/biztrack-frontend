// kiosk-admin/ReportHeader.jsx
import React from "react";
import { Activity, RefreshCw } from "lucide-react";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const ReportHeader = ({ refreshData, loading, businessName }) => {
  const { primaryColor } = useTheme();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        >
          <Activity size={22} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
            Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time insights and business analytics{businessName ? ` · ${businessName}` : ''}
          </p>
        </div>
      </div>

      <button
        onClick={refreshData}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Refreshing' : 'Refresh'}
      </button>
    </header>
  );
};

export default ReportHeader;
