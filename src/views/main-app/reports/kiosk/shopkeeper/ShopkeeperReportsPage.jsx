import React, { useState, useMemo, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
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
import TransactionDetailsModal from "./TransactionDetails";

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
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  // Add modal loading states like DebtManagement
  const [modalLoading, setModalLoading] = useState(false);
  const [modalLoadingText, setModalLoadingText] = useState("");

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

    console.log("🏢 Business information:", {
      businessId,
      businessUUID,
      businessName: currentUser.businessName,
      businessType: currentUser.businessType
    });

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
        console.log('Error parsing transaction date:', e);
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

  // Same pattern as DebtManagement - open modal with loader
  const openModalWithLoader = async (transaction) => {
    setModalLoading(true);
    setModalLoadingText("Loading transaction details...");
    await new Promise(resolve => setTimeout(resolve, 300));
    setSelectedTransaction(transaction);
    setModalLoading(false);
    setModalOpen(true);
  };

  const handleViewTransaction = (transactionId) => {
    const transaction = transactionsMap[transactionId];
    if (transaction) {
      openModalWithLoader(transaction);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleRefresh = () => {
    setContentLoaded(false);
    fetchTransactions();
  };

  // Combined loading state
  const isLoading = loading || !contentLoaded || (!userData.initialized && loading);

  // MODAL LOADING STATE - like DebtManagement
  if (modalLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={modalLoadingText}
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // INITIAL LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading daily reports..."
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
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
                ? "Please log in to access the reports system."
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

  // MODAL VIEW - Same pattern as DebtManagement: when modal is open, show ONLY the modal
  if (modalOpen && selectedTransaction) {
    return (
      <div className="min-h-screen bg-white p-1 sm:p-2 md:p-3 flex items-center justify-center">
        <div className="w-full max-w-full mx-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-full md:max-w-4xl">
            <TransactionDetailsModal
              open={modalOpen}
              onClose={handleCloseModal}
              transaction={selectedTransaction}
            />
          </div>
        </div>
      </div>
    );
  }

  // REPORTS VIEW - Normal reports page
  return (
    <div className="min-h-screen bg-white p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Reports - {userData.shopkeeperInfo?.businessName || "Kiosk"}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{dateString}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
          </div>
          {userData.shopkeeperInfo && (
            <div className="text-sm text-gray-500 mt-1">
              Shopkeeper: <span className="font-medium">{userData.shopkeeperInfo.shopkeeperName}</span>
              {todayData.length > 0 && (
                <span className="ml-4">
                  Today's Transactions: <span className="font-medium">{todayData.length}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <ReportCards salesData={salesData} debtData={debtData} />

      {/* Tabs Navigation */}
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

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
  );
}