import React from "react";
import CircleIcon from "@mui/icons-material/Circle";
import "./table.css";
import {
  formatPill,
  formatPillOutbound,
} from "../../utilities/Sharedfunctions.jsx";

export default function TablePill({ state, page, type }) {
  // Ensure state is treated as a string
  const stateString = String(state || '');

  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase();

    // HANDLE PAYMENT METHODS
    if (type === "payment") {
      if (statusLower === "cash") return "table-pill green";
      if (statusLower === "m-pesa" || statusLower === "mpesa") return "table-pill blue";
      if (statusLower === "debt") return "table-pill orange";
      return "table-pill grey";
    }

    // DEBT MANAGEMENT STATUSES (for page="debts")
    if (page === "debts") {
      if (statusLower === "recovered") return "table-pill green";
      if (statusLower === "overdue") return "table-pill red";
      if (statusLower === "pending") return "table-pill orange";
    }

    // PRODUCT STATUSES
    if (statusLower.includes('in stock')) return "table-pill green";
    if (statusLower.includes('low stock')) return "table-pill orange";
    if (statusLower.includes('out of stock')) return "table-pill red";

    // TRANSACTION STATUSES
    if (statusLower === "pending" ||
      statusLower === "new" ||
      statusLower === "received" ||
      statusLower === "draft" ||
      statusLower === "processing" ||
      statusLower === "approvalpending" ||
      statusLower === "pending approval" ||
      statusLower === "draft/pending approval") {
      return "table-pill orange";
    } else if (statusLower === "active" ||
      statusLower === "success" ||
      statusLower === "completed" ||
      statusLower === "paid" ||
      statusLower === "sent" ||
      statusLower === "approved" ||
      statusLower === "posted" ||
      statusLower === "readyforpayout" ||
      statusLower === "recovered") { // Also handle "recovered" in general
      return "table-pill green";
    } else {
      return "table-pill red";
    }
  };

  const formatDisplayStatus = (status) => {
    const statusLower = status.toLowerCase();

    // PAYMENT METHOD DISPLAY
    if (type === "payment") {
      if (statusLower === "cash") return 'Cash';
      if (statusLower === "m-pesa" || statusLower === "mpesa") return 'M-PESA';
      if (statusLower === "debt") return 'Debt';
      return status;
    }

    // DEBT MANAGEMENT STATUS DISPLAY
    if (page === "debts") {
      if (statusLower === "recovered") return 'Recovered';
      if (statusLower === "overdue") return 'Overdue';
      if (statusLower === "pending") return 'Pending';
    }

    // PRODUCT STATUS DISPLAY
    if (statusLower.includes('in stock')) return 'In Stock';
    if (statusLower.includes('low stock')) return 'Low Stock';
    if (statusLower.includes('out of stock')) return 'Out of Stock';

    // KEEP EXISTING FORMATTING
    return page === "outbound" ? formatPillOutbound(status) : formatPill(status);
  };

  return (
    <div className={getStatusClass(stateString)}>
      <CircleIcon />
      {formatDisplayStatus(stateString)}
    </div>
  );
}