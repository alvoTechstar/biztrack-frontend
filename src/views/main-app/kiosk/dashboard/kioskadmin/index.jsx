import React, { useMemo, useState, useEffect } from "react";
import { DollarSign, TrendingUp, Clock, AlertCircle, Calendar, RefreshCw, LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StatsCard from "./StatsCard";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../../components/theme/ThemeContext";

// Import components
import TransactionDetailsModal from "./TransactionDetailsModal";
import PaymentChart from "./charts/PaymentChart";
import TopProductsChart from "./charts/TopProductChart";
import TransactionsTable from "./TransactionsTable";

// Helper functions
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.value);
  const token = localStorage.getItem('token');
  const theme = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [userData, setUserData] = useState({
    user: null,
    businessId: null,
    businessUUID: null,
    shopkeeperInfo: null,
    initialized: false
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const todayDate = getTodayDateString();
  const yesterdayDate = getYesterdayDateString();
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const startTime = "08:00 AM";
  const endTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check authentication and extract user data
  useEffect(() => {
    const authTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 2000);

    if (!currentUser || !token) {
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      clearTimeout(authTimeout);
      return;
    }

    const businessId = currentUser.businessId;
    const businessUUID = currentUser.businessUUID;

    if (!businessId || !businessUUID) {
      console.error("No business information found in user data");
      setError("No business assigned to your account. Please contact administrator.");
      setLoading(false);
      clearTimeout(authTimeout);
      return;
    }

    const shopkeeperInfo = {
      shopkeeperId: currentUser.id,
      shopkeeperName: `${currentUser.firstName} ${currentUser.lastName}`,
      shopkeeperEmail: currentUser.email || "",
      shopkeeperRole: currentUser.role || "Kiosk_Shopkeeper",
      businessId: businessId,
      businessUUID: businessUUID,
      businessName: currentUser.businessName,
      businessType: currentUser.businessType
    };

    setUserData({
      user: currentUser,
      businessId,
      businessUUID,
      shopkeeperInfo,
      initialized: true
    });

    clearTimeout(authTimeout);
  }, [currentUser, token, navigate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      setContentLoaded(false);

      if (!userData.businessId) {
        setTimeout(() => {
          setContentLoaded(true);
          setLoading(false);
        }, 500);
        return;
      }

      let endpoint;
      if (URLS.TRANSACTIONS?.GET_TRANSACTIONS_BY_BUSINESS) {
        endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS.replace(
          ':businessId',
          userData.businessId
        );
      }
      else if (URLS.TRANSACTIONS?.GET_TRANSACTIONS_BY_KIOSK) {
        endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_KIOSK.replace(
          ':kioskId',
          userData.businessId
        );
      } else {
        throw new Error('No transaction endpoints configured');
      }

      const result = await GET(endpoint);

      if (!result || result.success === false) {
        await fetchAllTransactionsAndFilter();
        return;
      }

      const transactionData = result.transactions || result.data || [];

      setTransactions(transactionData);

      setTimeout(() => {
        setContentLoaded(true);
      }, 500);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      await fetchAllTransactionsAndFilter();
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactionsAndFilter = async () => {
    try {
      if (URLS.TRANSACTIONS?.GET_ALL_TRANSACTIONS) {
        const result = await GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS);

        if (result && result.success) {
          const allTransactions = result.transactions || result.data || [];

          const filteredTransactions = allTransactions.filter(t =>
            t.businessId === userData.businessId ||
            t.businessId?.toString() === userData.businessId?.toString()
          );

          setTransactions(filteredTransactions);
          setTimeout(() => {
            setContentLoaded(true);
          }, 500);
          return;
        }
      }

      setTransactions([]);
      setTimeout(() => {
        setContentLoaded(true);
      }, 500);

    } catch (fetchError) {
      console.error('Error in alternative fetch method:', fetchError);
      setError('Unable to load transactions. Please check backend configuration.');
      setContentLoaded(true);
    }
  };

  useEffect(() => {
    if (userData.initialized) {
      fetchTransactions();
    }
  }, [userData.initialized]);

  // Filter today's transactions - For stats only
  const todayTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp || transaction.createdAt).toISOString().split('T')[0];
      return transactionDate === todayDate;
    });
  }, [transactions, todayDate]);

  // Filter yesterday's transactions - used only to compute the day-over-day change
  const yesterdayTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp || transaction.createdAt).toISOString().split('T')[0];
      return transactionDate === yesterdayDate;
    });
  }, [transactions, yesterdayDate]);

  const sumCompletedSales = (list) =>
    list
      .filter(
        (t) =>
          t.status?.toLowerCase() === "completed" &&
          (t.paymentMethod?.toLowerCase() === "cash" ||
            t.paymentMethod?.toLowerCase() === "mpesa" ||
            t.paymentMethod?.toLowerCase() === "m-pesa" ||
            t.paymentMethod?.toLowerCase() === "debt")
      )
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  // Calculate total sales for TODAY only
  const totalSalesToday = useMemo(() => sumCompletedSales(todayTransactions), [todayTransactions]);

  // Calculate total sales for YESTERDAY only, used for the day-over-day comparison
  const totalSalesYesterday = useMemo(() => sumCompletedSales(yesterdayTransactions), [yesterdayTransactions]);

  // Calculate profit for TODAY only
  const totalProfitToday = useMemo(() => {
    return Math.round(totalSalesToday * 0.35);
  }, [totalSalesToday]);

  // Day-over-day % change. Profit is a fixed 35% of sales, so the same
  // percentage change applies to both the sales and profit cards.
  const salesChangePercent = useMemo(() => {
    if (totalSalesYesterday > 0) {
      return ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100;
    }
    return totalSalesToday > 0 ? 100 : 0;
  }, [totalSalesToday, totalSalesYesterday]);

  const formattedSalesChange = `${salesChangePercent >= 0 ? '+' : ''}${salesChangePercent.toFixed(1)}%`;

  // Calculate payment counts for TODAY only (including debt)
  const paymentCounts = useMemo(() => {
    return todayTransactions.reduce(
      (acc, t) => {
        if (t.status?.toLowerCase() !== "completed") return acc;
        const paymentMethod = t.paymentMethod?.toLowerCase();
        if (paymentMethod === "cash") acc.cash++;
        else if (paymentMethod === "mpesa" || paymentMethod === "m-pesa") acc.mpesa++;
        else if (paymentMethod === "debt") acc.debt++;
        return acc;
      },
      { cash: 0, mpesa: 0, debt: 0 }
    );
  }, [todayTransactions]);

  // Calculate top selling products for TODAY only
  const productSales = useMemo(() => {
    const productMap = {};

    todayTransactions.forEach(transaction => {
      if (transaction.status?.toLowerCase() === "completed" &&
        transaction.items && Array.isArray(transaction.items)) {
        transaction.items.forEach(item => {
          const productName = item.productName || 'Unknown Product';
          const quantity = item.quantity || 0;

          if (!productMap[productName]) {
            productMap[productName] = 0;
          }
          productMap[productName] += quantity;
        });
      }
    });

    return Object.entries(productMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);
  }, [todayTransactions]);

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleRefresh = () => {
    setContentLoaded(false);
    fetchTransactions();
  };

  const isLoading = loading || !contentLoaded || (!userData.initialized && loading);

  // Show initial loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading dashboard..."
          loadedText=""
          color={theme.primaryColor || "primary"}
        />
      </div>
    );
  }

  if (!userData.user || !userData.businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">
            {!userData.user ? "User Not Logged In" : "No Business Assigned"}
          </div>
          <div className="text-gray-600 mb-6">
            {!userData.user
              ? "Please log in to access the dashboard."
              : "Your account is not assigned to any business. Please contact your administrator."}
          </div>
          {!userData.user && (
            <button
              onClick={() => navigate('/login')}
              className="text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primaryColor || '#3b82f6' }}
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700">Sales Overview</h2>
            <p className="text-sm text-gray-500">
              {userData.shopkeeperInfo?.businessName || "Dashboard"}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
              style={{ backgroundColor: theme.primaryColor || '#3b82f6' }}
            >
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Sales Overview
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Welcome back, {userData.shopkeeperInfo?.shopkeeperName}! Here's your business at a glance
              </p>
              <div className="flex items-center gap-4 text-gray-500 mt-1.5">
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{dateString}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{startTime} - {endTime}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-fit"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {/* Stats Cards - TODAY only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Sales Today"
            value={`KSh ${totalSalesToday.toLocaleString()}`}
            change={formattedSalesChange}
            icon={<DollarSign />}
            color="blue"
          />
          <StatsCard
            title="Profit Today"
            value={`KSh ${totalProfitToday.toLocaleString()}`}
            change={formattedSalesChange}
            icon={<TrendingUp />}
            color="green"
          />

          {/* Payment Chart Component - TODAY only */}
          <PaymentChart paymentCounts={paymentCounts} />

          {/* Top Products Chart Component - TODAY only */}
          <TopProductsChart productSales={productSales} />
        </div>

        {/* Transactions Table Component - ALL transactions */}
        <TransactionsTable
          todayTransactions={transactions}
          onViewTransaction={handleViewTransaction}
          isLoading={loading}
        />
        </div>
      </div>

      {/* Transaction Details Modal Component */}
      <TransactionDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
}