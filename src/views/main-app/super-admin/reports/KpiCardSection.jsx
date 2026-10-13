import React, { useMemo } from "react";
import {
  AttachMoney as CommissionIcon,
  Receipt as TransactionIcon,
  TrendingUp as AvgCommissionIcon,
  PendingActions as PendingIcon,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useTheme as useAppTheme } from "../../../../components/theme/ThemeContext";

const formatKSh = (amount) => {
  if (!amount || isNaN(amount)) return "KSh 0.00";
  return `KSh ${parseFloat(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const KPICardsSection = ({ kpiData = {}, loading = false, transactions = [] }) => {
  const { primaryColor } = useAppTheme();
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

  // Loading state — same ContentLoader used across kiosk, hotel and super admin
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading KPIs..."
          loadedText=""
          color={primaryColor}
        />
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
      title: "Total Commission",
      value: calculatedKpiData.totalCommissionEarned,
      icon: <CommissionIcon fontSize="small" className="text-green-600" />,
      iconBg: "bg-green-50",
      caption: "From completed transactions",
    },
    {
      id: "transactions",
      title: "Total Transactions",
      value: calculatedKpiData.totalTransactions,
      icon: <TransactionIcon fontSize="small" className="text-blue-600" />,
      iconBg: "bg-blue-50",
      caption: `${calculatedKpiData.completedTransactions} completed, ${calculatedKpiData.failedTransactions} failed`,
    },
    {
      id: "avg-commission",
      title: "Avg. Commission/Txn",
      value: calculatedKpiData.avgCommissionPerTransaction,
      icon: <AvgCommissionIcon fontSize="small" className="text-purple-600" />,
      iconBg: "bg-purple-50",
      caption: "Average per transaction",
    },
    {
      id: "pending",
      title: "Pending Commissions",
      value: calculatedKpiData.pendingCommissions,
      icon: <PendingIcon fontSize="small" className="text-amber-600" />,
      iconBg: "bg-amber-50",
      caption: "Awaiting payment",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{card.title}</p>
            <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          <p className="text-base sm:text-xl font-bold text-gray-900 mt-2 truncate">{card.value}</p>
          {card.caption && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{card.caption}</p>
          )}
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