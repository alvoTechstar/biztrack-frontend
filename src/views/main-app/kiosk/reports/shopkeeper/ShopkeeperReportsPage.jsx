import React, { useState, useMemo, useEffect } from "react";
import { Clock, Calendar, RefreshCw, FileBarChart } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";

import TabsNavigation from "./TabsNavigation";
import SalesReport from "./Salesreport";
import DebtReport from "./DebtReport";
import ProductSummary from "./ProductSummary";
import ReportCards from "./ReportsCard";

export default function ShopkeeperReportsPage() {
  const { primaryColor } = useTheme();
  const navigate = useNavigate();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth?.value);
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);

  // User data state
  const [userData, setUserData] = useState({
    user: null,
    businessId: null,
    businessUUID: null,
    shopkeeperInfo: null,
    initialized: false
  });

  const [transactions, setTransactions] = useState([]);

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
        setContentLoaded(true);
        setLoading(false);
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
      setContentLoaded(true);
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
          setContentLoaded(true);
          return;
        }
      }

      setTransactions([]);
      setContentLoaded(true);

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

  const currentDate = new Date();
  const today = currentDate.toISOString().split('T')[0];
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

  const todayData = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.timestamp && !transaction.date) return false;

      let transactionDate;
      try {
        transactionDate = transaction.timestamp
          ? new Date(transaction.timestamp).toISOString().split('T')[0]
          : new Date(transaction.date).toISOString().split('T')[0];
      } catch (e) {
        return false;
      }

      return transactionDate === today;
    });
  }, [transactions, today]);

  // Sales Report Data
  const salesData = useMemo(() => {
    const salesTransactions = todayData.filter(t => {
      const status = (t.status || '').toLowerCase();
      const paymentMethod = (t.paymentMethod || '').toLowerCase();
      const originalPaymentMethod = (t.originalPaymentMethod || '').toLowerCase();

      return status === 'completed' &&
        (paymentMethod === 'cash' || paymentMethod === 'mpesa' || paymentMethod === 'm-pesa') &&
        paymentMethod !== 'debt' &&
        originalPaymentMethod !== 'debt';
    });

    const completedTransactions = salesTransactions.filter(t =>
      (t.status || '').toLowerCase() === 'completed'
    );
    const pendingTransactions = todayData.filter(t => {
      const status = (t.status || '').toLowerCase();
      const paymentMethod = (t.paymentMethod || '').toLowerCase();
      return status === 'pending' &&
        (paymentMethod === 'cash' || paymentMethod === 'mpesa' || paymentMethod === 'm-pesa') &&
        paymentMethod !== 'debt';
    });
    const failedTransactions = todayData.filter(t => {
      const status = (t.status || '').toLowerCase();
      const paymentMethod = (t.paymentMethod || '').toLowerCase();
      return status === 'failed' &&
        (paymentMethod === 'cash' || paymentMethod === 'mpesa' || paymentMethod === 'm-pesa');
    });

    const totalRevenue = completedTransactions.reduce(
      (sum, t) => sum + (t.totalAmount || t.total || 0),
      0
    );

    const productSales = {};
    completedTransactions.forEach((transaction) => {
      transaction.items?.forEach((item) => {
        const productName = item.productName || item.name || item.product?.name || "Unknown Product";
        const quantity = item.quantity || 0;

        if (productSales[productName]) {
          productSales[productName] += quantity;
        } else {
          productSales[productName] = quantity;
        }
      });
    });

    const mostSoldProduct = Object.entries(productSales).reduce(
      (max, [name, quantity]) =>
        quantity > max.quantity ? { name, quantity } : max,
      { name: "None", quantity: 0 }
    );

    const statusCounts = {
      completed: completedTransactions.length,
      pending: pendingTransactions.length,
      failed: failedTransactions.length,
      total: salesTransactions.length,
    };

    return {
      totalRevenue,
      statusCounts,
      mostSoldProduct,
      salesTransactions,
      completedTransactions,
    };
  }, [todayData]);

  // Debt Report Data
  const debtData = useMemo(() => {
    const debtTransactions = todayData.filter(t => {
      const paymentMethod = (t.paymentMethod || '').toLowerCase();
      const originalPaymentMethod = (t.originalPaymentMethod || '').toLowerCase();
      return paymentMethod === 'debt' || originalPaymentMethod === 'debt';
    });

    const pendingDebt = debtTransactions.filter(t =>
      (t.status || '').toLowerCase() === 'pending'
    );
    const completedDebt = debtTransactions.filter(t =>
      (t.status || '').toLowerCase() === 'completed'
    );
    const failedDebt = debtTransactions.filter(t =>
      (t.status || '').toLowerCase() === 'failed'
    );

    const totalOutstanding = pendingDebt.reduce((sum, t) =>
      sum + (t.totalAmount || t.total || 0), 0
    );
    const totalRecovered = completedDebt.reduce((sum, t) =>
      sum + (t.totalAmount || t.total || 0), 0
    );
    const totalFailed = failedDebt.reduce((sum, t) =>
      sum + (t.totalAmount || t.total || 0), 0
    );

    const statusCounts = {
      pending: pendingDebt.length,
      completed: completedDebt.length,
      failed: failedDebt.length,
      total: debtTransactions.length,
    };

    const recoveryRate = debtTransactions.length > 0
      ? ((completedDebt.length / debtTransactions.length) * 100).toFixed(1)
      : 0;

    return {
      totalOutstanding,
      totalRecovered,
      totalFailed,
      debtTransactions,
      statusCounts,
      pendingDebt,
      completedDebt,
      failedDebt,
      recoveryRate,
    };
  }, [todayData]);

  // Product Summary Data
  const productSummary = useMemo(() => {
    const productData = {};

    todayData
      .filter((t) => {
        const status = (t.status || '').toLowerCase();
        const paymentMethod = (t.paymentMethod || '').toLowerCase();
        const originalPaymentMethod = (t.originalPaymentMethod || '').toLowerCase();
        return status === 'completed' &&
          paymentMethod !== 'debt' &&
          originalPaymentMethod !== 'debt';
      })
      .forEach((transaction) => {
        transaction.items?.forEach((item) => {
          const productName = item.productName || item.name || item.product?.name || "Unknown Product";
          const quantity = item.quantity || 0;
          const price = item.unitPrice || item.price || item.product?.price || 0;
          const revenue = quantity * price;

          if (productData[productName]) {
            productData[productName].quantity += quantity;
            productData[productName].revenue += revenue;
          } else {
            productData[productName] = {
              name: productName,
              quantity: quantity,
              revenue: revenue,
            };
          }
        });
      });

    return Object.values(productData).sort((a, b) => {
      if (sortBy === "name")
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      if (sortBy === "quantity")
        return sortOrder === "asc"
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      if (sortBy === "revenue")
        return sortOrder === "asc"
          ? a.revenue - b.revenue
          : b.revenue - a.revenue;
      return 0;
    });
  }, [todayData, sortBy, sortOrder]);

  const transactionsMap = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const id = t._id || t.id;
      if (id) {
        map[id] = t;
      }
    });
    return map;
  }, [transactions]);

  const handleViewTransaction = (transactionId) => {
    const transaction = transactionsMap[transactionId];
    if (!transaction) return;

    const routeId = transaction.transactionId || transaction._id || transaction.id;
    navigate(`/shopkeeper/reports/transactions/${encodeURIComponent(routeId)}`, {
      state: { transaction },
    });
  };

  const handleRefresh = () => {
    setContentLoaded(false);
    fetchTransactions();
  };

  // Combined loading state
  const isLoading = loading || !contentLoaded || (!userData.initialized && loading);

  // INITIAL LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading daily reports..."
          loadedText=""
          color={primaryColor}
        />
      </div>
    );
  }

  // ERROR STATE
  if (!userData.user || !userData.businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">
            {!userData.user ? "User Not Logged In" : "No Business Assigned"}
          </div>
          <div className="text-gray-600 mb-6">
            {!userData.user
              ? "Please log in to access the reports system."
              : "Your account is not assigned to any business. Please contact your administrator."}
          </div>
          {!userData.user && (
            <button
              onClick={() => navigate('/login')}
              className="text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  // REPORTS VIEW
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              <FileBarChart size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Daily Reports - {userData.shopkeeperInfo?.businessName || "Kiosk"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 mt-0.5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateString}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{startTime} - {endTime}</span>
                </div>
              </div>
              {userData.shopkeeperInfo && (
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Shopkeeper: <span className="font-medium">{userData.shopkeeperInfo.shopkeeperName}</span>
                  {todayData.length > 0 && (
                    <span className="ml-3">
                      Today's Transactions: <span className="font-medium">{todayData.length}</span>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 sm:mb-8">
          <ReportCards salesData={salesData} debtData={debtData} />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 0 && (
          <SalesReport
            salesData={salesData}
            color={primaryColor}
            onViewTransaction={handleViewTransaction}
          />
        )}
        {activeTab === 1 && (
          <DebtReport
            debtData={debtData}
            color={primaryColor}
            onViewTransaction={handleViewTransaction}
          />
        )}
        {activeTab === 2 && (
          <ProductSummary
            productSummary={productSummary}
            color={primaryColor}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(field) => {
              if (sortBy === field) {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              } else {
                setSortBy(field);
                setSortOrder("desc");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
