import React from "react";

// Payment channel pill — same rectangle, fixed-width language as OrderStatusPill.
const CHANNEL_META = {
  cash: { label: "Cash", classes: "bg-blue-100 text-blue-800" },
  mpesa: { label: "M-Pesa", classes: "bg-green-100 text-green-800" },
  bank_transfer: { label: "Bank Transfer", classes: "bg-violet-100 text-violet-800" },
  bank: { label: "Bank Transfer", classes: "bg-violet-100 text-violet-800" },
};

export const formatPaymentChannel = (method) => {
  const key = String(method || "").toLowerCase();
  if (CHANNEL_META[key]) return CHANNEL_META[key].label;
  const raw = String(method || "").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "—";
};

export default function PaymentChannelPill({ method, className = "" }) {
  const key = String(method || "").toLowerCase();
  const meta = CHANNEL_META[key];
  return (
    <span
      className={`inline-block w-24 px-2 py-0.5 rounded text-xs font-semibold text-center whitespace-nowrap ${
        meta ? meta.classes : "bg-gray-100 text-gray-600"
      } ${className}`}
    >
      {formatPaymentChannel(method)}
    </span>
  );
}
