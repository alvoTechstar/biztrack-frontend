// kiosk-admin/StaffDashboard.jsx
import React, { useMemo } from "react";
import DataTable from "../../../../../components/datatable";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const StaffDashboard = ({
  staffData,
  loading,
  formatCurrency,
  getInitials,
  LoadingOverlay,
  Star,
  MoreVertical,
  Users,
  Trophy,
  RechartsTooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  isToday = true,
  filteredTransactions = [],
  onRefresh,
  onDateRangeChange,
  onFilterChange,
  selectedDateRange,
  selectedFilters,
  formatDate,
  openModalForEdit,
  openEnableView,
  openEnableModal,
  openDisableModal,
  openDeleteModal
}) => {

  const normalizeName = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const theme = useTheme();

  // ===== STEP 1: PROCESS STAFF DATA WITH FILTERED TRANSACTIONS =====
  const performanceData = useMemo(() => {
    console.log('📊 Processing staff data...', {
      staffCount: staffData?.length || 0,
      transactionCount: filteredTransactions?.length || 0
    });

    if (!staffData || staffData.length === 0) return [];

    const staffPerformance = staffData.map(staff => {
      const staffFirstName = staff.firstName || '';
      const staffLastName = staff.lastName || '';
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim();
      const normalizedStaffFullName = normalizeName(staffFullName);
      const normalizedStaffFirstName = normalizeName(staffFirstName);
      const normalizedStaffLastName = normalizeName(staffLastName);
      const normalizedStaffEmail = normalizeName(staff.email || '');

      let staffTransactions = [];
      let completedTransactions = [];
      let totalSalesFromTransactions = 0;
      let transactionsCount = 0;
      let completedTransactionsCount = 0;
      let avgSale = 0;
      let successRate = 0;

      if (filteredTransactions && filteredTransactions.length > 0) {
        staffTransactions = filteredTransactions.filter(transaction => {
          if (!transaction) return false;

          const shopkeeperName = transaction.shopkeeperName || '';
          const normalizedShopkeeper = normalizeName(shopkeeperName);

          const transactionStaffEmail = transaction.shopkeeperEmail || '';
          const normalizedTransactionEmail = normalizeName(transactionStaffEmail);

          if (normalizedShopkeeper && normalizedStaffFullName &&
            (normalizedShopkeeper === normalizedStaffFullName ||
              normalizedShopkeeper.includes(normalizedStaffFullName) ||
              normalizedStaffFullName.includes(normalizedShopkeeper))) {
            return true;
          }

          if (normalizedTransactionEmail && normalizedStaffEmail &&
            normalizedTransactionEmail === normalizedStaffEmail) {
            return true;
          }

          if (transaction.shopkeeperId && staff.id && transaction.shopkeeperId === staff.id) {
            return true;
          }

          if (normalizedShopkeeper && normalizedStaffFirstName &&
            normalizedShopkeeper.includes(normalizedStaffFirstName)) {
            return true;
          }

          if (normalizedShopkeeper && normalizedStaffLastName &&
            normalizedShopkeeper.includes(normalizedStaffLastName)) {
            return true;
          }

          return false;
        });

        transactionsCount = staffTransactions.length;

        completedTransactions = staffTransactions.filter(t => {
          const status = t.status?.toLowerCase();
          return status === 'completed' || status === 'success' || status === 'paid';
        });

        completedTransactionsCount = completedTransactions.length;

        totalSalesFromTransactions = completedTransactions.reduce((sum, t) => {
          const amount = parseFloat(t.totalAmount) || 0;
          return sum + amount;
        }, 0);

        avgSale = completedTransactionsCount > 0 ?
          totalSalesFromTransactions / completedTransactionsCount : 0;

        successRate = transactionsCount > 0 ?
          (completedTransactionsCount / transactionsCount) * 100 : 0;
      }

      let rating;
      if (completedTransactionsCount > 0) {
        let baseRating = 3.0;

        if (successRate > 90) baseRating += 1.0;
        else if (successRate > 80) baseRating += 0.7;
        else if (successRate > 70) baseRating += 0.4;

        if (avgSale > 5000) baseRating += 1.0;
        else if (avgSale > 2000) baseRating += 0.7;
        else if (avgSale > 1000) baseRating += 0.4;

        if (completedTransactionsCount > 50) baseRating += 0.8;
        else if (completedTransactionsCount > 20) baseRating += 0.5;
        else if (completedTransactionsCount > 10) baseRating += 0.3;

        rating = Math.min(baseRating + (Math.random() * 0.2), 5.0);
      } else {
        rating = 3.5 + Math.random() * 0.6;
      }

      const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#EF4444", "#06B6D4", "#84CC16"];
      let colorIndex = 0;
      if (staff.id) {
        const idStr = String(staff.id);
        let hash = 0;
        for (let i = 0; i < idStr.length; i++) {
          hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        colorIndex = Math.abs(hash) % colors.length;
      } else {
        colorIndex = Math.floor(Math.random() * colors.length);
      }

      let performanceScore = 0;
      if (completedTransactionsCount > 0) {
        const salesScore = Math.min(Math.round((totalSalesFromTransactions / 100000) * 25), 25);
        const transactionScore = Math.min(completedTransactionsCount * 1.5, 25);
        const successRateScore = Math.min(Math.round(successRate * 0.4), 25);
        const ratingScore = Math.min(rating * 5, 25);
        performanceScore = salesScore + transactionScore + successRateScore + ratingScore;
      }

      const performanceStatus = performanceScore >= 90 ? "Top Performer" :
        performanceScore >= 80 ? "Excellent" :
          performanceScore >= 70 ? "Good" :
            performanceScore >= 60 ? "Average" : "Needs Improvement";

      return {
        ...staff,
        fullName: staffFullName,
        email: staff.email || '',
        username: staff.username || '',
        transactions: transactionsCount,
        completedTransactions: completedTransactionsCount,
        totalSales: totalSalesFromTransactions,
        avgSale: avgSale,
        rating: parseFloat(rating.toFixed(1)),
        successRate: parseFloat(successRate.toFixed(1)),
        imageColor: colors[colorIndex],
        performanceScore: Math.min(performanceScore, 100),
        performanceStatus,
        dateJoined: staff.dateJoined || staff.createdAt,
        status: (staff.status || 'INACTIVE').toUpperCase(),
        role: staff.role || 'Staff'
      };
    }).sort((a, b) => b.totalSales - a.totalSales);

    const totalMatchedTransactions = staffPerformance.reduce((sum, staff) => sum + staff.transactions, 0);
    console.log('📊 Staff Performance Summary:', {
      totalStaff: staffPerformance.length,
      totalTransactions: totalMatchedTransactions,
      unmatchedTransactions: filteredTransactions?.length - totalMatchedTransactions || 0,
      sampleStaff: staffPerformance[0] ? {
        name: staffPerformance[0].fullName,
        transactions: staffPerformance[0].transactions,
        totalSales: staffPerformance[0].totalSales,
        status: staffPerformance[0].status
      } : 'No staff data'
    });

    return staffPerformance;
  }, [staffData, filteredTransactions]);

  // ===== STEP 2: CALCULATE SUMMARY STATISTICS =====
  const summaryStats = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        totalCompletedTransactions: 0,
        avgRating: 0,
        avgSuccessRate: 0,
        topPerformer: null,
        activeStaff: 0,
        totalStaff: 0,
        totalFiltered: filteredTransactions?.length || 0,
        matchedTransactions: 0
      };
    }

    const totalSales = performanceData.reduce((sum, staff) => sum + staff.totalSales, 0);
    const totalTransactions = performanceData.reduce((sum, staff) => sum + staff.transactions, 0);
    const totalCompletedTransactions = performanceData.reduce((sum, staff) => sum + staff.completedTransactions, 0);
    const avgRating = performanceData.length > 0 ?
      performanceData.reduce((sum, staff) => sum + staff.rating, 0) / performanceData.length : 0;
    const avgSuccessRate = performanceData.length > 0 ?
      performanceData.reduce((sum, staff) => sum + staff.successRate, 0) / performanceData.length : 0;
    const activeStaff = performanceData.filter(staff => staff.status === 'ACTIVE').length;
    const topPerformer = performanceData.length > 0 ? performanceData[0] : null;
    const matchedTransactions = performanceData.reduce((sum, staff) => sum + staff.transactions, 0);

    return {
      totalSales,
      totalTransactions,
      totalCompletedTransactions,
      avgRating: parseFloat(avgRating.toFixed(1)),
      avgSuccessRate: parseFloat(avgSuccessRate.toFixed(1)),
      topPerformer,
      activeStaff,
      totalStaff: performanceData.length,
      totalFiltered: filteredTransactions?.length || 0,
      matchedTransactions,
      unmatchedTransactions: (filteredTransactions?.length || 0) - matchedTransactions
    };
  }, [performanceData, filteredTransactions]);

  // ===== STEP 3: PREPARE DATA FOR DATATABLE =====
  const tableData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) return [];

    return performanceData.map((staff, index) => ({
      id: staff.id || `staff-${index}`,
      firstName: staff.firstName || '',
      lastName: staff.lastName || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || '',
      transactions: staff.transactions,
      completedTransactions: staff.completedTransactions,
      totalSales: staff.totalSales,
      avgSale: Math.round(staff.avgSale),
      rating: staff.rating,
      successRate: staff.successRate,
      performanceScore: staff.performanceScore,
      performanceStatus: staff.performanceStatus,
      status: staff.status,
      dateJoined: formatDate?.(staff.dateJoined) || staff.dateJoined || '',
      staffData: staff,
      imageColor: staff.imageColor
    }));
  }, [performanceData, formatDate]);

  // ===== STEP 4: DEFINE DATATABLE HEADERS =====
  const tableHeaders = useMemo(() => [
    { title: 'First Name', key: 'firstName' },
    { title: 'Last Name', key: 'lastName' },
    { title: 'Email', key: 'email' },
    { title: 'Role', key: 'role' },
    { title: 'Transactions', key: 'transactions' },
    { title: 'Completed', key: 'completedTransactions' },
    { title: 'Total Sales', key: 'totalSales' },
    { title: 'Status', key: 'status' }
  ], []);

  // ===== STEP 5: FIXED CUSTOM CELL RENDERER =====
  const customRenderCell = (column, header) => {
    // For status column, return the status value and let DataTable render TablePill
    if (header.key === "status") {
      return column[header.key] || '';
    }

    // For other columns, use custom rendering
    switch (header.key) {
      case "firstName":
      case "lastName":
      case "email":
      case "role":
        return (
          <div className="text-sm text-gray-700">
            {column[header.key] || 'N/A'}
          </div>
        );

      case "transactions":
      case "completedTransactions":
        // Just display the number, no extra text
        return (
          <div className="text-center">
            <div className="text-sm font-semibold">{column[header.key]}</div>
          </div>
        );

      case "totalSales":
        return (
          <div className="text-sm font-semibold text-green-600 text-center">
            {formatCurrency(column.totalSales)}
          </div>
        );

      default:
        return column[header.key] || '';
    }
  };

  const handleRowClick = (event, column) => {
    console.log('Row clicked:', column);
  };

  const handleSelectAll = (allSelected) => {
    console.log('Select all:', allSelected);
  };

  const handleSelectedAction = (selectedIds) => {
    console.log('Selected items changed:', selectedIds);
  };

  // ===== RENDERING LOGIC =====
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <LoadingOverlay />
      </div>
    );
  }

  if (!staffData || staffData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
        <Users size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No staff members found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Performance Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {isToday ? "Today's staff performance metrics and analytics" : "Staff performance metrics and analytics"}
            </p>
            <div className="text-sm text-gray-500 mt-2">
              Analyzing {summaryStats.totalFiltered} transactions • {summaryStats.matchedTransactions} matched to staff • {summaryStats.unmatchedTransactions} unmatched
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={20} />
            <span>{summaryStats.totalStaff} staff members • {summaryStats.activeStaff} active</span>
          </div>
        </div>

        {/* ===== SUMMARY STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {/* Total Sales Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Total Team Sales</p>
                <h4 className="text-2xl font-bold text-blue-900">
                  {formatCurrency(summaryStats.totalSales)}
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  From {summaryStats.totalCompletedTransactions} completed sales
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Transactions Card */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Staff Transactions</p>
                <h4 className="text-2xl font-bold text-green-900">
                  {summaryStats.totalTransactions}
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  {summaryStats.avgSuccessRate.toFixed(1)}% avg success rate
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Average Rating Card */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">Average Rating</p>
                <h4 className="text-2xl font-bold text-purple-900">
                  {summaryStats.avgRating.toFixed(1)}/5.0
                </h4>
                <p className="text-xs text-purple-700 mt-1">
                  Based on {performanceData.length} staff members
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="text-purple-600 fill-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Top Performer Card */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">Top Performer</p>
                <h4 className="text-xl font-bold text-orange-900 truncate">
                  {summaryStats.topPerformer?.fullName || 'N/A'}
                </h4>
                <p className="text-xs text-orange-700 mt-1">
                  {summaryStats.topPerformer
                    ? `${formatCurrency(summaryStats.topPerformer.totalSales)} sales`
                    : 'No data'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Trophy className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STAFF PERFORMANCE TABLE ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isToday ? "Today's Staff Performance" : "Staff Performance Report"}
              </h3>
              <p className="text-sm text-gray-600">
                {isToday ? "Complete staff performance metrics for today" : "Detailed staff performance metrics"}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Showing {performanceData.length} staff {isToday ? 'active today' : ''}
            </div>
          </div>
        </div>
        <div className="">
          {performanceData.length > 0 ? (
            <DataTable
              // CRITICAL: Use type that doesn't interfere with customRenderCell
              type="staff-performance" // Changed from "user-table" to avoid conflicts
              data={tableData}
              headers={tableHeaders}
              customRenderCell={customRenderCell}
              searchFilter=""
              openFilter={false}
              columnFilters={[]}
              columnFilter={[]}
              columnFilter2={[]}
              actions={[]}
              selected={[]}
              selectedAction={handleSelectedAction}
              actionSelected={() => { }}
              selectedRow={handleRowClick}
              selectAll={handleSelectAll}
              all={false}
              dates={null}
              color={theme.primaryColor}
              clickable={true}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filteredTransactions?.length === 0 ? "No Transactions Found" : "No Staff Activity"}
              </h3>
              <p className="text-gray-600">
                {filteredTransactions?.length === 0
                  ? "No transactions found for the selected date range/filters."
                  : "Staff members are available but no transactions were matched to them in this period."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;