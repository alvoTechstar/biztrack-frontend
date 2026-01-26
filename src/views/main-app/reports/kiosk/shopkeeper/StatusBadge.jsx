import React from "react";

const StatusBadge = ({ status, type = "status" }) => {
  const getStatusColor = () => {
    if (type === "payment") {
      switch (status) {
        case "Cash":
          return "bg-green-100 text-green-800";
        case "M-PESA":
          return "bg-blue-100 text-blue-800";
        case "Debt":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    } else {
      switch (status?.toUpperCase()) {
        case "COMPLETED":
        case "RECOVERED":
          return "bg-green-100 text-green-800";
        case "PENDING":
          return "bg-yellow-100 text-yellow-800";
        case "FAILED":
        case "OVERDUE":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;