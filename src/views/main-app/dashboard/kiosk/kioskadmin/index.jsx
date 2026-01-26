import React, { useMemo, useState, useEffect } from "react";
import { DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";
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

// Calendar icon component
const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

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
  const [viewingTransaction, setViewingTransaction] = useState(false);

  const todayDate = getTodayDateString();
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
    console.log("🔍 Checking authentication status...");

    const authTimeout = setTimeout(() => {
      if (loading) {
        console.log("⚠️ Authentication check taking too long, proceeding...");
        setLoading(false);
      }
    }, 2000);

    if (!currentUser || !token) {
      console.log("❌ User not authenticated, redirecting to login");
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      clearTimeout(authTimeout);
      return;
    }

    console.log("✅ User authenticated:", {
      id: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      email: currentUser.email,
      role: currentUser.role
    });

    const businessId = currentUser.businessId;
    const businessUUID = currentUser.businessUUID;

    if (!businessId || !businessUUID) {
      console.error("❌ No business information found in user data");
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

    console.log("👤 Derived user data:", shopkeeperInfo);

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
        console.log("⏳ Waiting for business data initialization...");
        setTimeout(() => {
          setContentLoaded(true);
          setLoading(false);
        }, 500);
        return;
      }

      console.log('🔍 Fetching transactions for business:', userData.businessId);

      let endpoint;
      if (URLS.TRANSACTIONS?.GET_TRANSACTIONS_BY_BUSINESS) {
        endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS.replace(
          ':businessId',
          userData.businessId
        );
        console.log('🌐 Using business endpoint:', endpoint);
      }
      else if (URLS.TRANSACTIONS?.GET_TRANSACTIONS_BY_KIOSK) {
        endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_KIOSK.replace(
          ':kioskId',
          userData.businessId
        );
        console.log('🌐 Using kiosk endpoint with businessId:', endpoint);
      } else {
        throw new Error('No transaction endpoints configured');
      }

      const result = await GET(endpoint);

      if (!result || result.success === false) {
        console.log('⚠️ Business endpoint failed, trying alternative...');
        await fetchAllTransactionsAndFilter();
        return;
      }

      const transactionData = result.transactions || result.data || [];
      console.log('✅ Transactions data received:', transactionData.length, 'transactions');

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
      console.log('🔄 Trying to fetch all transactions and filter...');

      if (URLS.TRANSACTIONS?.GET_ALL_TRANSACTIONS) {
        const result = await GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS);

        if (result && result.success) {
          const allTransactions = result.transactions || result.data || [];
          console.log('📋 All transactions loaded:', allTransactions.length);

          const filteredTransactions = allTransactions.filter(t =>
            t.businessId === userData.businessId ||
            t.businessId?.toString() === userData.businessId?.toString()
          );

          console.log('✅ Filtered by businessId:', filteredTransactions.length);
          setTransactions(filteredTransactions);
          setTimeout(() => {
            setContentLoaded(true);
          }, 500);
          return;
        }
      }

      console.log('⚠️ No transactions available or endpoints not working');
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

  // Calculate total sales for TODAY only
  const totalSalesToday = useMemo(() => {
    return todayTransactions
      .filter(
        (t) =>
          t.status?.toLowerCase() === "completed" &&
          (t.paymentMethod?.toLowerCase() === "cash" ||
            t.paymentMethod?.toLowerCase() === "mpesa" ||
            t.paymentMethod?.toLowerCase() === "m-pesa" ||
            t.paymentMethod?.toLowerCase() === "debt")
      )
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }, [todayTransactions]);

  // Calculate profit for TODAY only
  const totalProfitToday = useMemo(() => {
    return Math.round(totalSalesToday * 0.35);
  }, [totalSalesToday]);

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

  // Create transactions map
  const transactionsMap = useMemo(() => {
    return transactions.reduce((map, transaction) => {
      const id = transaction.transactionId || transaction._id || transaction.id;
      if (id) {
        map[id] = transaction;
      }
      return map;
    }, {});
  }, [transactions]);

  // Handle view transaction with 2-second delay
  const handleViewTransaction = (transaction) => {
    console.log('handleViewTransaction called with:', transaction);

    // Show loading state
    setViewingTransaction(true);

    // Wait 2 seconds before opening modal
    setTimeout(() => {
      setSelectedTransaction(transaction);
      setModalOpen(true);
      setViewingTransaction(false);
    }, 2000);
  };

  const handleRefresh = () => {
    setContentLoaded(false);
    fetchTransactions();
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
  };

  const isLoading = loading || !contentLoaded || (!userData.initialized && loading);

  // Show loading state for transaction view
  if (viewingTransaction) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading transaction details..."
                loadedText=""
                color={theme.primaryColor || "primary"}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show initial loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading dashboard..."
                loadedText=""
                color={theme.primaryColor || "primary"}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData.user || !userData.businessId) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
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
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-2">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700">Sales Overview</h2>
          <p className="text-sm text-gray-500">
            {userData.shopkeeperInfo?.businessName || "Dashboard"}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white p-2">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-700">Sales Overview</h2>
              <p className="text-sm text-gray-500">
                Welcome back, {userData.shopkeeperInfo?.shopkeeperName}! Here's your business at a glance
              </p>
              <div className="flex items-center gap-4 text-gray-600 mt-1">
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
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards - TODAY only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Sales Today"
            value={`KSh ${totalSalesToday.toLocaleString()}`}
            change="+8.2%"
            icon={<DollarSign />}
            color="blue"
          />
          <StatsCard
            title="Profit Today"
            value={`KSh ${totalProfitToday.toLocaleString()}`}
            change="+5.7%"
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
          todayTransactions={transactions} // Changed from todayTransactions to transactions
          onViewTransaction={handleViewTransaction}
          isLoading={loading}
        />
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