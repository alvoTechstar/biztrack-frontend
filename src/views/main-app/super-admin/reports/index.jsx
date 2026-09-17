// src/views/main-app/reports/super-admin/SuperAdminReports.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Import components
import KPICardsSection from './KpiCardSection';
import ReportsControls from './ReportsControls';
import RevenueTrendChart from './RevenueTrendChart'
import TransactionsTable from '../dashboard/TransactionsTable';
import PaymentBreakdownChart from './PaymentBreakdownChart'
import BusinessPerformanceChart from './BusinessPerformanceChart'
// Import your services and utilities
import { GET } from '../../../../services/DatabaseServiceImp';
import URLS from '../../../../utilities/Endpoints';
import ContentLoader from '../../../../components/Loader/ContentLoader';
import Toaster from '../../../../components/Toaster';
import { useTheme as useAppTheme } from '../../../../components/theme/ThemeContext';

// Extend dayjs with necessary plugins
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const SuperAdminReports = () => {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const accentColor = appTheme.primaryColor || '#2563eb';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: [], paymentMethod: [] });

  // State for data from API
  const [apiData, setApiData] = useState({
    transactions: [],
    businesses: [],
    salesData: [],
    paymentBreakdown: [],
    businessPerformance: [],
    businessTypePerformance: [],
    kpiData: {}
  });

  // Toaster states
  const [toaster, setToaster] = useState({
    open: false,
    state: 'true',
    title: '',
    message: '',
    position: 'bottom'
  });

  // Helper function to show toaster
  const showToaster = (state, title, message) => {
    setToaster({
      open: true,
      state: state ? 'true' : 'false',
      title,
      message,
      position: 'bottom'
    });
  };

  // Fetch reports data when component mounts or when filters change
  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    setLoading(true);

    try {
      // Prepare query parameters
      const params = {};
      if (dateRange[0]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
      }
      if (dateRange[1]) {
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      // Fetch transactions data
      const transactionsResult = await GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS, params);

      // Extract transactions based on your API structure
      let transactions = [];

      if (Array.isArray(transactionsResult)) {
        transactions = transactionsResult;
      } else if (transactionsResult && typeof transactionsResult === 'object') {
        // Check different possible response structures
        if (Array.isArray(transactionsResult.transactions)) {
          transactions = transactionsResult.transactions;
        } else if (Array.isArray(transactionsResult.data)) {
          transactions = transactionsResult.data;
        } else if (Array.isArray(transactionsResult.results)) {
          transactions = transactionsResult.results;
        } else if (transactionsResult.success && Array.isArray(transactionsResult.data)) {
          transactions = transactionsResult.data;
        } else {
          // Try to extract any array from the object
          const keys = Object.keys(transactionsResult);
          for (const key of keys) {
            if (Array.isArray(transactionsResult[key])) {
              transactions = transactionsResult[key];
              break;
            }
          }
        }
      }

      // Filter transactions by date range if needed
      let filteredTransactions = transactions;
      if (dateRange[0] || dateRange[1]) {
        filteredTransactions = transactions.filter(transaction => {
          const transactionDate = dayjs(
            transaction?.date ||
            transaction?.createdAt ||
            transaction?.timestamp ||
            transaction?.transactionDate
          );

          const start = dateRange[0] ? dateRange[0].startOf('day') : null;
          const end = dateRange[1] ? dateRange[1].endOf('day') : null;

          if (!transactionDate.isValid()) return false;

          if (start && end) {
            return transactionDate.isBetween(start, end, 'day', '[]');
          } else if (start && !end) {
            return transactionDate.isSameOrAfter(start, 'day');
          } else if (!start && end) {
            return transactionDate.isSameOrBefore(end, 'day');
          }
          return true;
        });
      }

      // Fetch businesses for business performance
      const businessesResult = await GET(URLS.BUSINESS.GET_ALL_BUSINESSES);
      let businesses = [];

      if (Array.isArray(businessesResult)) {
        businesses = businessesResult;
      } else if (businessesResult && typeof businessesResult === 'object') {
        businesses = businessesResult.data || businessesResult.businesses || [];
      }

      // Calculate KPI data
      const kpiData = calculateKPIData(filteredTransactions);

      // Revenue Trend always shows Jan-Dec of one year: the year of the selected
      // date filter's start date if one is set, otherwise the current year.
      const referenceYear = dateRange[0] ? dateRange[0].year() : dayjs().year();

      // Process data for charts
      const salesData = processSalesData(filteredTransactions, referenceYear);
      const paymentBreakdown = processPaymentBreakdownData(filteredTransactions);
      const businessPerformance = processBusinessPerformanceData(filteredTransactions, businesses);
      const businessTypePerformance = processBusinessTypePerformance(filteredTransactions, businesses);

      setApiData({
        transactions: filteredTransactions,
        businesses,
        salesData,
        paymentBreakdown,
        businessPerformance,
        businessTypePerformance,
        kpiData
      });

      showToaster(true, 'Success', 'Reports data loaded successfully!');
    } catch (error) {
      console.error("Error fetching reports data:", error);
      showToaster(false, 'Error', 'Failed to load reports data. Using sample data.');

      // Set empty data structure
      setApiData({
        transactions: [],
        businesses: [],
        salesData: [],
        paymentBreakdown: [],
        businessPerformance: [],
        businessTypePerformance: [],
        kpiData: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        uniqueBusinesses: 0,
        cashCommission: 0,
        mpesaCommission: 0
      };
    }

    let totalRevenue = 0;
    let cashCommission = 0;
    let mpesaCommission = 0;
    const completedTransactions = [];
    const pendingTransactions = [];

    transactions.forEach(transaction => {
      const status = (transaction?.status || '').toLowerCase();
      const totalAmount = parseFloat(transaction?.totalAmount || transaction?.amount || 0);
      const commission = totalAmount * 0.05; // 5% commission

      if (status === 'completed') {
        completedTransactions.push(transaction);
        totalRevenue += commission;

        // Get payment method - strictly categorize as MPesa or Cash
        const paymentMethod = (
          transaction?.paymentMethod || 
          transaction?.type || 
          transaction?.payment_method || 
          ''
        ).toLowerCase();

        if (paymentMethod.includes('mpesa') || paymentMethod.includes('m-pesa') || paymentMethod.includes('m pesa')) {
          mpesaCommission += commission;
        } else if (paymentMethod.includes('cash')) {
          cashCommission += commission;
        }
        // Any other payment method is ignored to maintain strict MPesa/Cash only
      } else if (status === 'pending') {
        pendingTransactions.push(transaction);
      }
    });

    const uniqueBusinesses = new Set(
      transactions
        .map(t => t?.businessId || t?.businessName)
        .filter(Boolean)
    ).size;

    return {
      totalRevenue,
      totalTransactions: transactions.length,
      completedTransactions: completedTransactions.length,
      pendingTransactions: pendingTransactions.length,
      uniqueBusinesses,
      cashCommission,
      mpesaCommission
    };
  };

  // Process payment breakdown data - STRICTLY MPesa and Cash only
  const processPaymentBreakdownData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    let cashTotal = 0;
    let mpesaTotal = 0;
    let cashCount = 0;
    let mpesaCount = 0;

    transactions.forEach(transaction => {
      const status = (transaction?.status || '').toLowerCase();
      if (status !== 'completed') return;

      const totalAmount = parseFloat(transaction?.totalAmount || transaction?.amount || 0);
      const commission = totalAmount * 0.05;
      
      const paymentMethod = (
        transaction?.paymentMethod || 
        transaction?.type || 
        transaction?.payment_method || 
        ''
      ).toLowerCase();

      // Strictly categorize as MPesa or Cash
      if (paymentMethod.includes('mpesa') || paymentMethod.includes('m-pesa') || paymentMethod.includes('m pesa')) {
        mpesaTotal += commission;
        mpesaCount++;
      } else if (paymentMethod.includes('cash')) {
        cashTotal += commission;
        cashCount++;
      }
      // Any other payment method is ignored
    });

    const result = [];
    const totalCommission = cashTotal + mpesaTotal;

    if (mpesaTotal > 0) {
      result.push({
        name: 'MPesa',
        value: parseFloat(mpesaTotal.toFixed(2)),
        count: mpesaCount,
        percentage: totalCommission > 0 ? parseFloat(((mpesaTotal / totalCommission) * 100).toFixed(1)) : 0
      });
    }

    if (cashTotal > 0) {
      result.push({
        name: 'Cash',
        value: parseFloat(cashTotal.toFixed(2)),
        count: cashCount,
        percentage: totalCommission > 0 ? parseFloat(((cashTotal / totalCommission) * 100).toFixed(1)) : 0
      });
    }

    return result.sort((a, b) => b.value - a.value);
  };

  // Aggregates commission into a fixed Jan-Dec set of 12 buckets for referenceYear
  // (missing months filled with 0), instead of a daily series - a "Revenue Trend"
  // for a super-admin looking across the whole business is naturally a year-over-
  // months view, not a jagged day-by-day one.
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const processSalesData = (transactions, referenceYear) => {
    const commissionByMonth = Array(12).fill(0);

    (transactions || []).forEach(transaction => {
      const date = transaction?.date || transaction?.createdAt || transaction?.timestamp;
      if (!date) return;

      const parsed = dayjs(date);
      if (!parsed.isValid() || parsed.year() !== referenceYear) return;

      const totalAmount = parseFloat(transaction?.totalAmount || transaction?.amount || 0);
      const commission = totalAmount * 0.05;

      commissionByMonth[parsed.month()] += commission;
    });

    return MONTH_LABELS.map((label, index) => ({
      date: label,
      dateKey: `${referenceYear}-${String(index + 1).padStart(2, '0')}`,
      amount: parseFloat(commissionByMonth[index].toFixed(2))
    }));
  };

  // Per-business detail (used by the "Business Rankings" table, which can list
  // any number of businesses fine since it scrolls rather than plotting on an axis).
  const processBusinessPerformanceData = (transactions, businesses) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    const businessMap = businesses.reduce((acc, business) => {
      acc[business._id || business.id] = business;
      return acc;
    }, {});

    const performance = transactions.reduce((acc, transaction) => {
      const businessId = transaction?.businessId;
      const businessName = transaction?.businessName ||
        (businessMap[businessId]?.name) ||
        'Unknown Business';

      const totalAmount = parseFloat(transaction?.totalAmount || transaction?.amount || 0);
      const commission = totalAmount * 0.05;

      if (!acc[businessName]) {
        acc[businessName] = {
          name: businessName,
          commission: 0,
          transactions: 0,
          type: businessMap[businessId]?.type || 'Unknown'
        };
      }
      acc[businessName].commission += commission;
      acc[businessName].transactions += 1;
      return acc;
    }, {});

    const totalCommission = Object.values(performance).reduce((sum, b) => sum + b.commission, 0);

    return Object.values(performance)
      .map(business => ({
        ...business,
        percentage: totalCommission > 0 ? parseFloat(((business.commission / totalCommission) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.commission - a.commission);
  };

  // Chart-friendly view: grouped by business TYPE (Kiosk/Hotel/Hospital/...) instead
  // of one bar per individual business. A per-business bar chart breaks down at both
  // ends of the scale - one business stretches to fill the whole chart, a thousand
  // businesses can't fit on an axis at all - while the number of business types stays
  // small and fixed regardless of how many businesses exist. Individual businesses are
  // still fully listed in the ranking table below the chart, just not plotted as bars.
  const processBusinessTypePerformance = (transactions, businesses) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    const businessMap = businesses.reduce((acc, business) => {
      acc[business._id || business.id] = business;
      return acc;
    }, {});

    const performance = transactions.reduce((acc, transaction) => {
      const businessId = transaction?.businessId;
      const rawType = transaction?.businessType || businessMap[businessId]?.type || 'Unknown';
      const type = typeof rawType === 'string' && rawType.length > 0
        ? rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()
        : 'Unknown';

      const totalAmount = parseFloat(transaction?.totalAmount || transaction?.amount || 0);
      const commission = totalAmount * 0.05;

      if (!acc[type]) {
        acc[type] = { name: type, commission: 0, transactions: 0 };
      }
      acc[type].commission += commission;
      acc[type].transactions += 1;
      return acc;
    }, {});

    const totalCommission = Object.values(performance).reduce((sum, b) => sum + b.commission, 0);

    return Object.values(performance)
      .map(entry => ({
        ...entry,
        commission: parseFloat(entry.commission.toFixed(2)),
        percentage: totalCommission > 0 ? parseFloat(((entry.commission / totalCommission) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.commission - a.commission);
  };

  // Search + advanced (status / payment method) filters applied on top of the
  // date-filtered transactions already returned by fetchReportsData.
  const visibleTransactions = useMemo(() => {
    return apiData.transactions.filter(transaction => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch = !search || [
        transaction?.id,
        transaction?.transactionId,
        transaction?.businessName,
        transaction?.business?.name,
      ].some(field => (field || '').toString().toLowerCase().includes(search));

      const matchesStatus = !filters.status?.length ||
        filters.status.some(s => (s || '').toLowerCase() === (transaction?.status || '').toLowerCase());

      const paymentMethod = (transaction?.paymentMethod || transaction?.type || transaction?.payment_method || '').toLowerCase();
      const matchesPaymentMethod = !filters.paymentMethod?.length ||
        filters.paymentMethod.some(m => paymentMethod.includes((m || '').toLowerCase()));

      return matchesSearch && matchesStatus && matchesPaymentMethod;
    });
  }, [apiData.transactions, searchTerm, filters]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight={isMobile ? 300 : 400}
          sx={{ py: isMobile ? 3 : 4 }}
        >
          <ContentLoader
            state={true}
            loading={true}
            loadingText="Loading report data..."
            loadedText=""
            color="#1976d2"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      );
    }

    switch (selectedTab) {
      case 0: // Revenue Trend
        return (
          <RevenueTrendChart
            data={apiData.salesData}
            year={dateRange[0] ? dateRange[0].year() : dayjs().year()}
            loading={loading}
          />
        );
      case 1: // Transactions
        return (
          <TransactionsTable
            transactions={visibleTransactions}
            loading={loading}
          />
        );
      case 2: // Payment Breakdown
        return (
          <PaymentBreakdownChart
            transactions={apiData.transactions}
            loading={loading}
          />
        );
      case 3: // Business Performance
        return (
          <BusinessPerformanceChart
            data={apiData.businessPerformance}
            typeData={apiData.businessTypePerformance}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={(open) => setToaster({ ...toaster, open })}
        position={toaster.position}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <header className="flex items-center gap-3 mb-6 sm:mb-8">
          <div
            className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              Super Admin Reports
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Comprehensive financial and performance insights
            </p>
          </div>
        </header>

        {/* KPI Cards Section */}
        <div className="mb-6 sm:mb-8">
          <KPICardsSection
            kpiData={apiData.kpiData}
            transactions={apiData.transactions}
            loading={loading}
          />
        </div>

        {/* Date Range Filter & Export Buttons */}
        <div className="mb-6 sm:mb-8">
          <ReportsControls
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedTab={selectedTab}
            loading={loading}
            filteredTransactions={visibleTransactions}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 3, sm: 4 } }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="super admin reports tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: 44, sm: 48 },
              '& .MuiTab-root': {
                minHeight: { xs: 44, sm: 48 },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 500,
                textTransform: 'none',
                px: { xs: 2, sm: 3 },
                minWidth: { xs: 100, sm: 120 },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                backgroundColor: accentColor,
              },
              '& .Mui-selected': {
                color: `${accentColor} !important`,
              },
            }}
          >
            <Tab
              label={isMobile ? "Revenue" : "Revenue Trend"}
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              label="Transactions"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab
              label={isMobile ? "Payments" : "Payment Breakdown"}
              id="tab-2"
              aria-controls="tabpanel-2"
            />
            <Tab
              label={isMobile ? "Business" : "Business Performance"}
              id="tab-3"
              aria-controls="tabpanel-3"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <div role="tabpanel" id={`tabpanel-${selectedTab}`} aria-labelledby={`tab-${selectedTab}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminReports;