import React, { useState, useEffect } from "react";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import KPICards from "./KPICards";
import BusinessTable from "../../User-Management/super-admin/businesses/BusinessTable";
import UsersTable from "../../User-Management/super-admin/user-management/UsersTable";
import TransactionsTable from "./TransactionsTable";
import RevenueTable from "./RevenueTable";
import RevenueChart from "./RevenueCharts";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import Toaster from "../../../../components/Toaster";
import { GET } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

function SuperAdminDashboard() {
  const [activeView, setActiveView] = useState(null);
  const [loading, setLoading] = useState({
    kpi: true,
    businesses: false,
    users: false,
    transactions: false,
    revenue: false
  });

  const [data, setData] = useState({
    kpiData: {
      totalBusinesses: 0,
      totalUsers: 0,
      totalTransactions: 0,
      totalRevenue: 0
    },
    businesses: [],
    users: [],
    transactions: [],
    revenue: []
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [toaster, setToaster] = useState({
    open: false,
    state: 'true',
    title: '',
    message: '',
    position: isMobile ? 'bottom' : 'right'
  });

  useEffect(() => {
    setToaster(prev => ({
      ...prev,
      position: isMobile ? 'bottom' : 'right'
    }));
  }, [isMobile]);

  const showToaster = (state, title, message) => {
    setToaster({
      open: true,
      state: state ? 'true' : 'false',
      title,
      message,
      position: isMobile ? 'bottom' : 'right'
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(prev => ({ ...prev, kpi: true }));

    try {
      const [businessesResult, usersResult, transactionsResult] = await Promise.all([
        GET(URLS.BUSINESS.GET_ALL_BUSINESSES),
        GET(URLS.USERS.GET_ALL_USERS),
        GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS)
      ]);
      let transactions = [];

      if (Array.isArray(transactionsResult)) {
        transactions = transactionsResult;
      } else if (transactionsResult && typeof transactionsResult === 'object') {
        if (Array.isArray(transactionsResult.transactions)) {
          transactions = transactionsResult.transactions;
        } else if (Array.isArray(transactionsResult.data)) {
          transactions = transactionsResult.data;
        } else if (Array.isArray(transactionsResult.results)) {
          transactions = transactionsResult.results;
        } else if (transactionsResult.success && Array.isArray(transactionsResult.data)) {
          transactions = transactionsResult.data;
        } else {
          transactions = Object.values(transactionsResult).filter(item =>
            item && typeof item === 'object'
          );
        }
      }
      const businesses = Array.isArray(businessesResult) ? businessesResult :
        (businessesResult?.data || businessesResult?.businesses || []);
      const users = Array.isArray(usersResult) ? usersResult :
        (usersResult?.data || usersResult?.users || []);
      const totalRevenue = transactions.reduce((sum, transaction) => {
        const amount = parseFloat(transaction?.totalAmount) ||
          parseFloat(transaction?.amount) ||
          parseFloat(transaction?.transactionAmount) ||
          parseFloat(transaction?.total) ||
          parseFloat(transaction?.amountPaid) || 0;

        // Calculate 5% commission
        const commission = amount * 0.05;
        return sum + commission;
      }, 0);

      const kpiData = {
        totalBusinesses: businesses.length,
        totalUsers: users.length,
        totalTransactions: transactions.length,
        totalRevenue: totalRevenue
      };
      const revenueData = processRevenueData(transactions);

      setData({
        kpiData,
        businesses,
        users,
        transactions,
        revenue: revenueData
      });

      showToaster(true, 'Success', 'Dashboard loaded successfully!');
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToaster(false, 'Error', 'Failed to load dashboard data');
    } finally {
      setLoading(prev => ({ ...prev, kpi: false }));
    }
  };

  const processRevenueData = (transactions) => {
    const revenueByDate = {};

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction?.totalAmount) ||
        parseFloat(transaction?.amount) ||
        parseFloat(transaction?.transactionAmount) ||
        parseFloat(transaction?.total) || 0;
      const commission = amount * 0.05;
      const dateValue = transaction?.createdAt ||
        transaction?.timestamp ||
        transaction?.transactionDate ||
        transaction?.date ||
        transaction?.createdDate;

      if (dateValue && commission > 0) {
        try {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            const dateKey = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });

            if (!revenueByDate[dateKey]) {
              revenueByDate[dateKey] = 0;
            }
            revenueByDate[dateKey] += commission;
          }
        } catch (error) {
          console.error("Error processing transaction date:", error);}
      }
    });
    return Object.entries(revenueByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => {
        try {
          return new Date(a.date) - new Date(b.date);
        } catch {
          return 0;
        }
      });
  };
  const fetchBusinesses = async () => {
    setLoading(prev => ({ ...prev, businesses: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await GET(URLS.BUSINESS.GET_ALL_BUSINESSES);
      const businesses = Array.isArray(result) ? result :
        (result?.data || result?.businesses || []);
      setData(prev => ({
        ...prev,
        businesses,
        kpiData: {
          ...prev.kpiData,
          totalBusinesses: businesses.length
        }
      }));
    } catch (error) {
      console.error("Error fetching businesses:", error);
      showToaster(false, 'Error', 'Failed to load businesses');
    } finally {
      setLoading(prev => ({ ...prev, businesses: false }));
    }
  };
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await GET(URLS.USERS.GET_ALL_USERS);
      const users = Array.isArray(result) ? result :
        (result?.data || result?.users || []);
      setData(prev => ({
        ...prev,
        users,
        kpiData: {
          ...prev.kpiData,
          totalUsers: users.length
        }
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      showToaster(false, 'Error', 'Failed to load users');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };
  const fetchTransactions = async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS);
      let transactions = [];
      if (Array.isArray(result)) {
        transactions = result;
      } else if (result && typeof result === 'object') {
        if (Array.isArray(result.transactions)) {
          transactions = result.transactions;
        } else if (Array.isArray(result.data)) {
          transactions = result.data;
        } else {
          transactions = Object.values(result).filter(item =>
            item && typeof item === 'object'
          );
        }
      }

      const totalRevenue = transactions.reduce((sum, transaction) => {
        const amount = parseFloat(transaction?.totalAmount) ||
          parseFloat(transaction?.amount) ||
          parseFloat(transaction?.transactionAmount) || 0;
        const commission = amount * 0.05;
        return sum + commission;
      }, 0);
      const revenueData = processRevenueData(transactions);
      setData(prev => ({
        ...prev,
        transactions,
        revenue: revenueData,
        kpiData: {
          ...prev.kpiData,
          totalTransactions: transactions.length,
          totalRevenue: totalRevenue
        }
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showToaster(false, 'Error', 'Failed to load transactions');
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };
  const fetchRevenueData = async () => {
    setLoading(prev => ({ ...prev, revenue: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const revenueData = processRevenueData(data.transactions);
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
      setData(prev => ({
        ...prev,
        revenue: revenueData,
        kpiData: {
          ...prev.kpiData,
          totalRevenue: totalRevenue
        }
      }));
    } catch (error) {
      console.error("Error processing revenue data:", error);
      showToaster(false, 'Error', 'Failed to process revenue data');
    } finally {
      setLoading(prev => ({ ...prev, revenue: false }));
    }
  };

  useEffect(() => {
    if (activeView) {
      switch (activeView) {
        case "businesses":
          if (data.businesses.length === 0) {
            fetchBusinesses();
          }
          break;
        case "admins":
          if (data.users.length === 0) {
            fetchUsers();
          }
          break;
        case "transactions":
          if (data.transactions.length === 0) {
            fetchTransactions();
          }
          break;
        case "revenue":
          if (data.transactions.length > 0 && data.revenue.length === 0) {
            fetchRevenueData();
          } else if (data.transactions.length === 0) {
            fetchTransactions();
          }
          break;
        default:
          break;
      }
    }
  }, [activeView]);

  const handleCardClick = (viewName) => {
    setActiveView(viewName);
  };

  const handleViewTransaction = (transaction) => {
    alert(`Viewing transaction: ${transaction.transactionId || transaction._id}`);
  };

  const KPICardsSkeleton = () => {
    const skeletonCount = isMobile ? 2 : 4;
    const gridCols = isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'grid-cols-4';
    const gap = isMobile ? 'gap-2' : 'gap-4';

    return (
      <div className={`grid ${gridCols} ${gap} mb-6`}>
        {Array(skeletonCount).fill(0).map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-4 sm:p-6 animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 sm:h-12 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveComponent = () => {
    if (loading.kpi && activeView === null) {
      return (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <ContentLoader
            state={true}
            loading={true}
            loadingText="Loading dashboard..."
            loadedText=""
            color="#1976d2"
            size={isMobile ? "small" : "medium"}
          />
        </div>
      );
    }
    const viewLoadingStates = {
      businesses: loading.businesses,
      admins: loading.users,
      transactions: loading.transactions,
      revenue: loading.revenue
    };

    if (activeView && viewLoadingStates[activeView]) {
      return (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <ContentLoader
            state={true}
            loading={true}
            loadingText={`Loading ${activeView}...`}
            loadedText=""
            color="#1976d2"
            size={isMobile ? "small" : "medium"}
          />
        </div>
      );
    }

    if (activeView === null) {
      return <RevenueChart businesses={data.businesses} isMobile={isMobile} />;
    }
    switch (activeView) {
      case "businesses":
        if (data.businesses.length === 0) {
          return (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 text-3xl sm:text-4xl mb-3">🏢</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">No businesses found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Click refresh to try again</p>
              <button
                onClick={fetchBusinesses}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white text-sm sm:text-base rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          );
        }
        return (
          <div className="overflow-x-auto">
            <BusinessTable
              filteredBusinesses={data.businesses}
              selectedItems={[]}
              setSelectedItems={() => { }}
              toggleSelectAll={() => { }}
              toggleSelectItem={() => { }}
              openModalForEdit={() => { }}
              openEnableView={() => { }}
              openEnableModal={() => { }}
              openDisableModal={() => { }}
              openDeleteModal={() => { }}
              isMobile={isMobile}
            />
          </div>
        );

      case "admins":
        if (data.users.length === 0) {
          return (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 text-3xl sm:text-4xl mb-3">👥</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">No users found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Click refresh to try again</p>
              <button
                onClick={fetchUsers}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white text-sm sm:text-base rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          );
        }
        return (
          <div className="overflow-x-auto">
            <UsersTable filteredUsers={data.users} isMobile={isMobile} />
          </div>
        );

      case "transactions":
        if (data.transactions.length === 0) {
          return (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 text-3xl sm:text-4xl mb-3">💰</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">No transactions found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Click refresh to try again</p>
              <button
                onClick={fetchTransactions}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white text-sm sm:text-base rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          );
        }
        return (
          <div className="overflow-x-auto">
            <TransactionsTable
              transactions={data.transactions}
              todayTransactions={data.transactions}
              onViewTransaction={handleViewTransaction}
              isMobile={isMobile}
            />
          </div>
        );

      case "revenue":
        return (
          <div className="overflow-x-auto">
            <RevenueTable revenueData={data.transactions} isMobile={isMobile} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={(open) => setToaster({ ...toaster, open })}
        position={toaster.position}
      />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8">
        <header className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">
            Biztrack Super Admin Dashboard
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
            Overview of platform performance and analytics
          </p>
        </header>

        <div className="mb-6 sm:mb-8 md:mb-10">
          {loading.kpi ? (
            <KPICardsSkeleton />
          ) : (
            <KPICards
              data={data.kpiData}
              onCardClick={handleCardClick}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}
        </div>

        <div className="mt-6 sm:mt-8 md:mt-10">
          <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
            <Grid item xs={12} className="w-full p-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {renderActiveComponent()}
              </div>
            </Grid>
          </Grid>
        </div>
        {isMobile && <div className="pb-20"></div>}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;