import React from "react";
import {
  Store as BusinessIcon,
  People as UsersIcon,
  Receipt as TransactionIcon,
  AttachMoney as RevenueIcon,
} from "@mui/icons-material";

const KPICards = ({ data = {}, onCardClick, activeView }) => {
  const safeData = {
    totalBusinesses: data.totalBusinesses || 0,
    totalUsers: data.totalUsers || 0,
    totalTransactions: data.totalTransactions || 0,
    totalRevenue: data.totalRevenue || 0,
  };

  const cards = [
    {
      id: "businesses",
      title: "Total Businesses",
      value: safeData.totalBusinesses.toLocaleString(),
      icon: <BusinessIcon fontSize="medium" className="text-blue-600" />,
      iconBg: "bg-blue-50",
      ring: "hover:ring-blue-200",
    },
    {
      id: "admins",
      title: "Total Users",
      value: safeData.totalUsers.toLocaleString(),
      icon: <UsersIcon fontSize="medium" className="text-indigo-600" />,
      iconBg: "bg-indigo-50",
      ring: "hover:ring-indigo-200",
    },
    {
      id: "transactions",
      title: "Total Transactions",
      value: safeData.totalTransactions.toLocaleString(),
      icon: <TransactionIcon fontSize="medium" className="text-emerald-600" />,
      iconBg: "bg-emerald-50",
      ring: "hover:ring-emerald-200",
    },
    {
      id: "revenue",
      title: "Total Revenue",
      value: `KSh ${safeData.totalRevenue.toLocaleString()}`,
      icon: <RevenueIcon fontSize="medium" className="text-purple-600" />,
      iconBg: "bg-purple-50",
      ring: "hover:ring-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const isActive = activeView === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick(card.id)}
            className={`text-left rounded-2xl p-4 sm:p-5 bg-white border shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ring-2 ring-transparent ${card.ring} ${
              isActive ? "border-gray-200 shadow-md" : "border-gray-100"
            }`}
          >
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-xl mb-3 sm:mb-4 ${card.iconBg}`}
            >
              {card.icon}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{card.title}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">{card.value}</p>
          </button>
        );
      })}
    </div>
  );
};

export default KPICards;