import React, { useMemo } from "react";
import {
  AttachMoney as CommissionIcon,
  Receipt as TransactionIcon,
  TrendingUp as AvgCommissionIcon,
  PendingActions as PendingIcon,
  Business as BusinessIcon,
  TrendingUp as GrowthIcon,
} from "@mui/icons-material";
import { CircularProgress, Box, Typography } from "@mui/material";

const formatKSh = (amount) => {
  if (!amount || isNaN(amount)) return "KSh 0.00";
  return `KSh ${parseFloat(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const KPICardsSection = ({ kpiData = {}, loading = false, transactions = [] }) => {
  // Calculate KPI data from provided kpiData or fallback to processing transactions
  const calculatedKpiData = useMemo(() => {
    // If kpiData is provided from API, use it directly
    if (kpiData && Object.keys(kpiData).length > 0) {
      return {
        totalCommissionEarned: formatKSh(kpiData.totalRevenue || kpiData.totalCommission || 0),
        totalTransactions: kpiData.totalTransactions?.toLocaleString() || "0",
        avgCommissionPerTransaction: formatKSh(kpiData.avgCommission || 0),
        pendingCommissions: formatKSh(kpiData.pendingCommissions || kpiData.pendingRevenue || 0),
        uniqueBusinesses: kpiData.uniqueBusinesses?.toLocaleString() || "0",
        growthRate: kpiData.growthRate ? `${kpiData.growthRate.toFixed(1)}%` : "0%",
        completedTransactions: kpiData.completedTransactions?.toLocaleString() || "0",
        failedTransactions: kpiData.failedTransactions?.toLocaleString() || "0",
      };
    }

    // Fallback: Calculate from transactions if no kpiData provided
    if (transactions && transactions.length > 0) {
      const completedTransactions = transactions.filter(
        (t) => t?.status?.toLowerCase() === "completed"
      );
      const pendingDebtTransactions = transactions.filter(
        (t) => (t?.paymentMethod?.toLowerCase() === "debt" || t?.status?.toLowerCase() === "pending") && t?.status?.toLowerCase() !== "completed"
      );
      const failedTransactions = transactions.filter(
        (t) => t?.status?.toLowerCase() === "failed"
      );

      const totalComm = completedTransactions.reduce(
        (sum, t) => sum + (parseFloat(t?.commission) || (parseFloat(t?.totalAmount) || 0) * 0.05),
        0
      );
      const totalTxns = completedTransactions.length;
      const avgComm = totalTxns > 0 ? totalComm / totalTxns : 0;
      const pendingComm = pendingDebtTransactions.reduce(
        (sum, t) => sum + (parseFloat(t?.commission) || (parseFloat(t?.totalAmount) || 0) * 0.05),
        0
      );
      
      // Calculate unique businesses
      const uniqueBusinesses = new Set(
        transactions
          .map(t => t?.businessName || t?.business?.name)
          .filter(Boolean)
      ).size;

      // Calculate growth rate (simplified)
      const growthRate = transactions.length > 1 ? 5.2 : 0; // This would be calculated from real data

      return {
        totalCommissionEarned: formatKSh(totalComm),
        totalTransactions: totalTxns.toLocaleString(),
        avgCommissionPerTransaction: formatKSh(avgComm),
        pendingCommissions: formatKSh(pendingComm),
        uniqueBusinesses: uniqueBusinesses.toLocaleString(),
        growthRate: `${growthRate}%`,
        completedTransactions: completedTransactions.length.toLocaleString(),
        failedTransactions: failedTransactions.length.toLocaleString(),
      };
    }

    // Default values when no data
    return {
      totalCommissionEarned: formatKSh(0),
      totalTransactions: "0",
      avgCommissionPerTransaction: formatKSh(0),
      pendingCommissions: formatKSh(0),
      uniqueBusinesses: "0",
      growthRate: "0%",
      completedTransactions: "0",
      failedTransactions: "0",
    };
  }, [kpiData, transactions]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-8 md:mb-10">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-5 animate-pulse min-h-[140px] sm:min-h-[150px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-grow ml-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Check if we have any data to show
  const hasData = (transactions && transactions.length > 0) || (kpiData && Object.keys(kpiData).length > 0);
  
  if (!hasData) {
    return (
      <Box className="mb-8 md:mb-10">
        <Typography variant="body1" className="text-gray-500 text-center p-8">
          No KPI data available. Try selecting a different date range.
        </Typography>
      </Box>
    );
  }

  const cards = [
    {
      id: "commission",
      title: "Total Commission Earned",
      value: calculatedKpiData.totalCommissionEarned,
      icon: <CommissionIcon fontSize="medium" className="text-green-600" />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      borderColor: "border-green-200",
      hover: "hover:scale-[1.02] hover:shadow-lg hover:shadow-green-100",
      description: "From completed transactions",
    },
    {
      id: "transactions",
      title: "Total Transactions",
      value: calculatedKpiData.totalTransactions,
      icon: <TransactionIcon fontSize="medium" className="text-blue-600" />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      borderColor: "border-blue-200",
      hover: "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-100",
      description: `${calculatedKpiData.completedTransactions} completed, ${calculatedKpiData.failedTransactions} failed`,
    },
    {
      id: "avg-commission",
      title: "Avg. Commission per Txn",
      value: calculatedKpiData.avgCommissionPerTransaction,
      icon: <AvgCommissionIcon fontSize="medium" className="text-purple-600" />,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      borderColor: "border-purple-200",
      hover: "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-100",
      description: "Average per transaction",
    },
    {
      id: "pending",
      title: "Pending Commissions",
      value: calculatedKpiData.pendingCommissions,
      icon: <PendingIcon fontSize="medium" className="text-amber-600" />,
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
      borderColor: "border-amber-200",
      hover: "hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-100",
      description: "Awaiting payment",
    },
    // Additional KPI cards (optional - uncomment if needed)
    // {
    //   id: "businesses",
    //   title: "Active Businesses",
    //   value: calculatedKpiData.uniqueBusinesses,
    //   icon: <BusinessIcon fontSize="medium" className="text-indigo-600" />,
    //   bgColor: "bg-indigo-50",
    //   iconBg: "bg-indigo-100",
    //   borderColor: "border-indigo-200",
    //   hover: "hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-100",
    //   description: "With active transactions",
    // },
    // {
    //   id: "growth",
    //   title: "Growth Rate",
    //   value: calculatedKpiData.growthRate,
    //   icon: <GrowthIcon fontSize="medium" className="text-teal-600" />,
    //   bgColor: "bg-teal-50",
    //   iconBg: "bg-teal-100",
    //   borderColor: "border-teal-200",
    //   hover: "hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-100",
    //   description: "Compared to previous period",
    // },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-8 md:mb-10">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`
            ${card.bgColor}
            border ${card.borderColor}
            rounded-xl shadow-sm
            p-4 sm:p-5 md:p-6
            transition-all duration-300 ease-out
            transform
            ${card.hover}
            flex flex-col
            min-h-[140px] sm:min-h-[150px]
            relative
            group
          `}
        >
          {/* Top Section: Icon and Title */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            {/* Icon Container */}
            <div
              className={`
                flex items-center justify-center
                w-10 h-10 sm:w-12 sm:h-12
                rounded-xl ${card.iconBg}
                p-2 sm:p-3
                flex-shrink-0
                transition-all duration-300
                group-hover:scale-110
              `}
            >
              {card.icon}
            </div>

            {/* Title */}
            <div className="ml-3 sm:ml-4 flex-grow">
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-tight text-right">
                {card.title}
              </p>
            </div>
          </div>

          {/* Center Section: Value */}
          <div className="flex-1 flex items-center justify-center mb-2">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center truncate">
              {card.value}
            </p>
          </div>

          {/* Bottom Section: Description */}
          {card.description && (
            <div className="mt-auto pt-2 border-t border-gray-200 border-opacity-50">
              <p className="text-xs text-gray-500 text-center truncate">
                {card.description}
              </p>
            </div>
          )}

          {/* Hover effect overlay */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
               style={{ 
                 background: `linear-gradient(135deg, ${card.iconBg.replace('bg-', '').replace('-100', '-200')} 0%, transparent 100%)`
               }}>
          </div>
        </div>
      ))}
    </div>
  );
};

// Optional: Enhanced Skeleton loader with more realistic animation
export const KPICardsSectionSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-8 md:mb-10">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-5 min-h-[140px] sm:min-h-[150px] overflow-hidden relative"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="flex-grow ml-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto relative z-10"></div>
      </div>
    ))}
  </div>
);

// Optional: Error state component
export const KPICardsSectionError = ({ message = "Failed to load KPI data" }) => (
  <div className="mb-8 md:mb-10">
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div className="text-red-500 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-700 font-medium mb-2">Error Loading Data</p>
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  </div>
);

export default KPICardsSection;