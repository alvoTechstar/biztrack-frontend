import React from "react";

const colorStyles = {
  blue: "from-blue-50 to-blue-100 text-blue-600",
  green: "from-green-50 to-green-100 text-green-600",
  purple: "from-purple-50 to-purple-100 text-purple-600",
  amber: "from-amber-50 to-amber-100 text-amber-600",
  red: "from-red-50 to-red-100 text-red-600",
  pink: "from-pink-50 to-pink-100 text-pink-600",
};

// Same card language as kiosk StatsCard: gradient header + value + day-over-day change.
// Accepts kiosk-style `change` ("+12.5%") or hotel-style `trend` ({ type: "up"|"down", value }).
const KpiCard = ({
  icon,
  title,
  value,
  color = "blue",
  change,
  trend = null,
  footer = "Compared to yesterday",
  onClick,
}) => {
  const colors = colorStyles[color] || colorStyles.blue;
  const changeText =
    change ?? (trend ? `${trend.type === "up" ? "+" : "-"}${trend.value}%` : null);
  const isNegative =
    typeof changeText === "string" && changeText.trim().startsWith("-");

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden h-full${
        onClick ? " cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className={`bg-gradient-to-r ${colors} px-4 py-3`}>
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-sm font-medium text-gray-700 truncate leading-5 min-h-[20px]"
            title={title}
          >
            {title}
          </h3>
          <div className={`${colors} shrink-0`}>{icon}</div>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-baseline">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {changeText && (
            <span
              className={`ml-2 text-sm font-medium ${
                isNegative ? "text-red-600" : "text-green-600"
              }`}
            >
              {changeText}
            </span>
          )}
        </div>
        {footer && <p className="text-xs text-gray-500 mt-2">{footer}</p>}
      </div>
    </div>
  );
};

export default KpiCard;
