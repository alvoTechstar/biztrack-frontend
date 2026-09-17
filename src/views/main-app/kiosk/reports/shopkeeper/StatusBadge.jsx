import React from "react";

const StatusBadge = ({ status, type = "status" }) => {
  const getStatusColor = () => {
    if (type === "payment") {
      switch ((status || "").toLowerCase()) {
        case "cash":
          return "bg-green-100 text-green-800";
        case "mpesa":
        case "m-pesa":
          return "bg-blue-100 text-blue-800";
        case "debt":
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

  const getDisplayText = () => {
    if (type === "payment") {
      switch ((status || "").toLowerCase()) {
        case "cash":
          return "Cash";
        case "mpesa":
        case "m-pesa":
          return "M-PESA";
        case "debt":
          return "Debt";
        default:
          return status || "Unknown";
      }
    }
    return status || "Unknown";
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
    >
      {getDisplayText()}
    </span>
  );
};

export default StatusBadge;