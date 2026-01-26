// src/views/main-app/reports/super-admin/SuperAdminReports.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Import components
import KPICardsSection from './KpiCardSection';
import ReportsControls from './ReportsControls';
import RevenueTrendChart from './RevenueTrendChart'
import TransactionsTable from '../../dashboard/super-admin/TransactionsTable';
import PaymentBreakdownChart from './PaymentBreakdownChart'
import BusinessPerformanceChart from './BusinessPerformanceChart'
// Import your services and utilities
import { GET } from '../../../../services/DatabaseServiceImp';
import URLS from '../../../../utilities/Endpoints';
import ContentLoader from '../../../../components/Loader/ContentLoader';
import Toaster from '../../../../components/Toaster';

// Extend dayjs with necessary plugins
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

const SuperAdminReports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // State for data from API
  const [apiData, setApiData] = useState({
    transactions: [],
    businesses: [],
    salesData: [],
    paymentBreakdown: [],
    businessPerformance: [],
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

      // Debug the response structure
      console.log('🔍 Transactions API Response:', transactionsResult);

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

      console.log('✅ Extracted Transactions:', transactions);
      console.log('✅ Transactions count:', transactions.length);

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

      console.log('✅ Businesses:', businesses);

      // Calculate KPI data
      const kpiData = calculateKPIData(filteredTransactions);

      // Process data for charts
      const salesData = processSalesData(filteredTransactions);
      const paymentBreakdown = processPaymentBreakdownData(filteredTransactions);
      const businessPerformance = processBusinessPerformanceData(filteredTransactions, businesses);

      setApiData({
        transactions: filteredTransactions,
        businesses,
        salesData,
        paymentBreakdown,
        businessPerformance,
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

  const processSalesData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];

    const salesByDate = transactions.reduce((acc, transaction) => {
      const date = transaction?.date || transaction?.createdAt || transaction?.timestamp;
      if (!date) return acc;

      const dateKey = dayjs(date).format('MMM D');
      const totalAmount = parseFloat(transaction?.totalAmount || transaction?.amount || 0);
      const commission = totalAmount * 0.05;

      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += commission;
      return acc;
    }, {});

    return Object.entries(salesByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => dayjs(a.date, 'MMM D').diff(dayjs(b.date, 'MMM D')));
  };

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

  const handleExport = async (format) => {
    try {
      setLoading(true);

      const params = {};
      if (dateRange[0]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
      }
      if (dateRange[1]) {
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      params.format = format;

      // Determine report type
      const reportTypes = ['sales', 'transactions', 'payment', 'business'];
      params.reportType = reportTypes[selectedTab] || 'sales';

      const result = await GET(URLS.REPORTS.EXPORT_REPORT, params);

      if (result && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      } else {
        showToaster(true, 'Success', `Report exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      showToaster(false, 'Error', 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

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
            loading={loading}
          />
        );
      case 1: // Transactions
        return (
          <TransactionsTable
            transactions={apiData.transactions}
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
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4, md: 6 }
        }}
      >
        <Toaster
          open={toaster.open}
          state={toaster.state}
          title={toaster.title}
          message={toaster.message}
          action={(open) => setToaster({ ...toaster, open })}
          position={toaster.position}
        />

        {/* Header */}
        <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            sx={{ 
              color: 'text.primary',
              fontWeight: 700,
              mb: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            Super Admin Reports
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Comprehensive financial and performance insights.
          </Typography>
        </Box>

        {/* KPI Cards Section */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <KPICardsSection
            kpiData={apiData.kpiData}
            transactions={apiData.transactions}
            loading={loading}
          />
        </Box>

        {/* Date Range Filter & Export Buttons */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <ReportsControls
            dateRange={dateRange}
            setDateRange={setDateRange}
            onExport={handleExport}
            selectedTab={selectedTab}
            loading={loading}
          />
        </Box>

        {/* Tabs Layout */}
        <Paper 
          elevation={isMobile ? 1 : 2} 
          sx={{ 
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            bgcolor: 'background.paper'
          }}
        >
          {/* Tabs with scrollable behavior for mobile */}
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="super admin reports tabs"
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                minHeight: { xs: 48, sm: 56 },
                '& .MuiTab-root': {
                  minHeight: { xs: 48, sm: 56 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.5, sm: 2 },
                  minWidth: { xs: 100, sm: 120 },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                },
                '& .MuiTabs-scrollButtons': {
                  width: { xs: 32, sm: 40 },
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
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
          <Box 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              bgcolor: 'background.paper'
            }}
            role="tabpanel"
            id={`tabpanel-${selectedTab}`}
            aria-labelledby={`tab-${selectedTab}`}
          >
            {renderTabContent()}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SuperAdminReports;