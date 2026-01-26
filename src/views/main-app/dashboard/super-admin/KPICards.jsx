import React from "react";
import {
  Store as BusinessIcon,
  People as UsersIcon,
  Receipt as TransactionIcon,
  AttachMoney as RevenueIcon,
} from "@mui/icons-material";

const KPICards = ({ data = {}, onCardClick }) => {
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
      icon: <BusinessIcon fontSize="large" className="text-blue-600" />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      hover: "hover:scale-105 hover:shadow-blue-300",
    },
    {
      id: "admins",
      title: "Total Users",
      value: safeData.totalUsers.toLocaleString(),
      icon: <UsersIcon fontSize="large" className="text-indigo-600" />, 
      bgColor: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      hover: "hover:scale-105 hover:shadow-indigo-300",
    },
    {
      id: "transactions",
      title: "Total Transactions",
      value: safeData.totalTransactions.toLocaleString(),
      icon: <TransactionIcon fontSize="large" className="text-green-600" />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      hover: "hover:-translate-y-1 hover:shadow-green-300",
    },
    {
      id: "revenue",
      title: "Total Revenue",
      value: `KSh ${safeData.totalRevenue.toLocaleString()}`,
      icon: <RevenueIcon fontSize="large" className="text-purple-600" />,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      hover: "hover:rotate-1 hover:shadow-purple-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick(card.id)}
          className={`rounded-lg p-4 shadow-sm transition-all transform cursor-pointer ${card.bgColor} ${card.hover}`}
        >
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 ${card.iconBg}`}
          >
            {card.icon}
          </div>
          <p className="text-sm text-gray-600 font-medium">{card.title}</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default KPICards;