import React from "react";

const SummaryCard = ({
    title,
    value,
    icon: Icon,
    bgColor = "bg-blue-100",
    iconColor = "text-blue-600",
    description,
}) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
            <div className="flex-1 pr-3 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {title}
                </p>
                <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
                {description && (
                    <p className="text-xs text-gray-600 mt-2">{description}</p>
                )}
            </div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${bgColor}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
        </div>
    </div>
);

export default SummaryCard;
