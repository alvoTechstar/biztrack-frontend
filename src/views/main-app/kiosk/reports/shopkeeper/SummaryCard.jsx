import React from "react";

const SummaryCard = ({
    title,
    value,
    icon: Icon,
    bgColor = "bg-gradient-to-br from-blue-50 to-blue-100",
    iconColor = "text-blue-600",
    description,
    trend,
    trendColor = "text-green-600",
}) => (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 overflow-hidden">
        {/* Background accent line - thinner */}
        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-blue-400 to-purple-400"></div>

        {/* Subtle background pattern - smaller */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
        </div>

        <div className="relative flex items-center justify-between">
            <div className="flex-1 pr-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {title}
                </p>
                <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <span className={`text-xs font-medium ${trendColor} flex items-center`}>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                            </svg>
                            {trend}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-gray-600 mt-2">{description}</p>
                )}
            </div>
            <div className={`relative p-3 rounded-full ${bgColor} transform group-hover:scale-105 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
                {/* Glow effect - smaller */}
                <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-r from-blue-400 to-purple-400 blur-xs"></div>
            </div>
        </div>

        {/* Progress bar for some cards - thinner */}
        {(title.includes("Revenue") || title.includes("Recovery")) && (
            <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: title.includes("Revenue") ? "85%" : title.includes("Recovery") ? "72%" : "100%" }}
                    ></div>
                </div>
            </div>
        )}
    </div>
);

export default SummaryCard;