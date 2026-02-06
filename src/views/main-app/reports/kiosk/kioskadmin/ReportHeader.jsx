// kiosk-admin/ReportHeader.jsx
import React from "react";
import { Activity } from "lucide-react";

const ReportHeader = ({ refreshData, error, ErrorAlert }) => {
  return (
    <div className="mb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-5 rounded-3xl blur-xl"></div>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Activity className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-gray-600 ml-1">
              Real-time insights and comprehensive business analytics
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && <ErrorAlert message={error} onRetry={refreshData} />}
      </div>
    </div>
  );
};

export default ReportHeader;