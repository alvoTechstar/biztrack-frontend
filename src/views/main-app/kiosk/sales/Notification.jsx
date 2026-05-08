import React from "react";
import { CheckCircle } from "lucide-react";

const Notification = ({ show, message, type }) => {
  if (!show) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${bgColor}`}
    >
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Notification;