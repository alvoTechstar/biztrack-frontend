import React, { useState, useEffect } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  LayoutDashboard,
  RefreshCw,
  Building2,
  Users,
  Receipt,
} from "lucide-react";
import KPICards from "./KPICards";
import BusinessTable from "../User-Management/businesses/BusinessTable";
import UsersTable from "../User-Management/user-management/UsersTable";
import TransactionsTable from "./TransactionsTable";
import RevenueTable from "./RevenueTable";
import RevenueChart from "./RevenueCharts";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import Toaster from "../../../../components/Toaster";
import { useTheme as useAppTheme } from "../../../../components/theme/ThemeContext";
import { GET } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

const KPI_SKELETON_KEYS = ["kpi-skeleton-1", "kpi-skeleton-2", "kpi-skeleton-3", "kpi-skeleton-4"];

function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {KPI_SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm animate-pulse"
        >
          <div className="h-11 w-11 bg-gray-100 rounded-xl mb-3 sm:mb-4"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

function SuperAdminDashboard() {
  const [activeView, setActiveView] = useState(null);
  const [loading, setLoading] = useState({
    kpi: true,
    businesses: false,
    users: false,
    transactions: false,
    revenue: false,
  });

  const [data, setData] = useState({
    kpiData: {
      totalBusinesses: 0,
      totalUsers: 0,
      totalTransactions: 0,
      totalRevenue: 0,
    },
    businesses: [],
    users: [],
    transactions: [],
    revenue: [],
  });
  const theme = useTheme();
  const { primaryColor } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [toaster, setToaster] = useState({
    open: false,
    state: "true",
    title: "",
    message: "",
    position: isMobile ? "bottom" : "right",
  });

  useEffect(() => {
    setToaster((prev) => ({
      ...prev,
      position: isMobile ? "bottom" : "right",
    }));
  }, [isMobile]);

  const showToaster = (state, title, message) => {
    setToaster({
      open: true,
      state: state ? "true" : "false",
      title,
      message,
      position: isMobile ? "bottom" : "right",
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading((prev) => ({ ...prev, kpi: true }));

    try {
      const [businessesResult, usersResult, transactionsResult] =
        await Promise.all([
          GET(URLS.BUSINESS.GET_ALL_BUSINESSES),
          GET(URLS.USERS.GET_ALL_USERS),
          GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS),
        ]);
      let transactions = [];

      if (Array.isArray(transactionsResult)) {
        transactions = transactionsResult;
      } else if (transactionsResult && typeof transactionsResult === "object") {
        if (Array.isArray(transactionsResult.transactions)) {
          transactions = transactionsResult.transactions;
        } else if (Array.isArray(transactionsResult.data)) {
          transactions = transactionsResult.data;
        } else if (Array.isArray(transactionsResult.results)) {
          transactions = transactionsResult.results;
        } else {
          transactions = Object.values(transactionsResult).filter(
            (item) => item && typeof item === "object",
          );
        }
      }
      const businesses = Array.isArray(businessesResult)
        ? businessesResult
        : businessesResult?.data || businessesResult?.businesses || [];
      const users = Array.isArray(usersResult)
        ? usersResult
        : usersResult?.data || usersResult?.users || [];
      const totalRevenue = transactions.reduce((sum, transaction) => {
        const amount =
          Number.parseFloat(transaction?.totalAmount) ||
          Number.parseFloat(transaction?.amount) ||
          Number.parseFloat(transaction?.transactionAmount) ||
          Number.parseFloat(transaction?.total) ||
          Number.parseFloat(transaction?.amountPaid) ||
          0;

        // Calculate 5% commission
        const commission = amount * 0.05;
        return sum + commission;
      }, 0);

      const kpiData = {
        totalBusinesses: businesses.length,
        totalUsers: users.length,
        totalTransactions: transactions.length,
        totalRevenue: totalRevenue,
      };
      const revenueData = processRevenueData(transactions);

      setData({
        kpiData,
        businesses,
        users,
        transactions,
        revenue: revenueData,
      });

      showToaster(true, "Success", "Dashboard loaded successfully!");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToaster(false, "Error", "Failed to load dashboard data");
    } finally {
      setLoading((prev) => ({ ...prev, kpi: false }));
    }
  };

  const processRevenueData = (transactions) => {
    const revenueByDate = {};

    transactions.forEach((transaction) => {
      const amount =
        Number.parseFloat(transaction?.totalAmount) ||
        Number.parseFloat(transaction?.amount) ||
        Number.parseFloat(transaction?.transactionAmount) ||
        Number.parseFloat(transaction?.total) ||
        0;
      const commission = amount * 0.05;
      const dateValue =
        transaction?.createdAt ||
        transaction?.timestamp ||
        transaction?.transactionDate ||
        transaction?.date ||
        transaction?.createdDate;

      if (dateValue && commission > 0) {
        try {
          const date = new Date(dateValue);
          if (!Number.isNaN(date.getTime())) {
            const dateKey = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            if (!revenueByDate[dateKey]) {
              revenueByDate[dateKey] = 0;
            }
            revenueByDate[dateKey] += commission;
          }
        } catch (error) {
          console.error("Error processing transaction date:", error);
        }
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
    setLoading((prev) => ({ ...prev, businesses: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await GET(URLS.BUSINESS.GET_ALL_BUSINESSES);
      const businesses = Array.isArray(result)
        ? result
        : result?.data || result?.businesses || [];
      setData((prev) => ({
        ...prev,
        businesses,
        kpiData: {
          ...prev.kpiData,
          totalBusinesses: businesses.length,
        },
      }));
    } catch (error) {
      console.error("Error fetching businesses:", error);
      showToaster(false, "Error", "Failed to load businesses");
    } finally {
      setLoading((prev) => ({ ...prev, businesses: false }));
    }
  };
  const fetchUsers = async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await GET(URLS.USERS.GET_ALL_USERS);
      const users = Array.isArray(result)
        ? result
        : result?.data || result?.users || [];
      setData((prev) => ({
        ...prev,
        users,
        kpiData: {
          ...prev.kpiData,
          totalUsers: users.length,
        },
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      showToaster(false, "Error", "Failed to load users");
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };
  const fetchTransactions = async () => {
    setLoading((prev) => ({ ...prev, transactions: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS);
      let transactions = [];
      if (Array.isArray(result)) {
        transactions = result;
      } else if (result && typeof result === "object") {
        if (Array.isArray(result.transactions)) {
          transactions = result.transactions;
        } else if (Array.isArray(result.data)) {
          transactions = result.data;
        } else {
          transactions = Object.values(result).filter(
            (item) => item && typeof item === "object",
          );
        }
      }

      const totalRevenue = transactions.reduce((sum, transaction) => {
        const amount =
          Number.parseFloat(transaction?.totalAmount) ||
          Number.parseFloat(transaction?.amount) ||
          Number.parseFloat(transaction?.transactionAmount) ||
          0;
        const commission = amount * 0.05;
        return sum + commission;
      }, 0);
      const revenueData = processRevenueData(transactions);
      setData((prev) => ({
        ...prev,
        transactions,
        revenue: revenueData,
        kpiData: {
          ...prev.kpiData,
          totalTransactions: transactions.length,
          totalRevenue: totalRevenue,
        },
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showToaster(false, "Error", "Failed to load transactions");
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }));
    }
  };
  const fetchRevenueData = async () => {
    setLoading((prev) => ({ ...prev, revenue: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const revenueData = processRevenueData(data.transactions);
      const totalRevenue = revenueData.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      setData((prev) => ({
        ...prev,
        revenue: revenueData,
        kpiData: {
          ...prev.kpiData,
          totalRevenue: totalRevenue,
        },
      }));
    } catch (error) {
      console.error("Error processing revenue data:", error);
      showToaster(false, "Error", "Failed to process revenue data");
    } finally {
      setLoading((prev) => ({ ...prev, revenue: false }));
    }
  };

  const loadDataForView = (view) => {
    switch (view) {
      case "businesses":
        if (data.businesses.length === 0) fetchBusinesses();
        break;
      case "admins":
        if (data.users.length === 0) fetchUsers();
        break;
      case "transactions":
        if (data.transactions.length === 0) fetchTransactions();
        break;
      case "revenue":
        if (data.transactions.length === 0) {
          fetchTransactions();
        } else if (data.revenue.length === 0) {
          fetchRevenueData();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadDataForView(activeView);
  }, [activeView]);

  const handleCardClick = (viewName) => {
    setActiveView(viewName);
  };

  const handleViewTransaction = (transaction) => {
    alert(
      `Viewing transaction: ${transaction.transactionId || transaction._id}`,
    );
  };

  const renderEmptyState = (Icon, label, onRetry) => (
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 text-gray-300">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">
        No {label} found
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Click refresh to try loading the data again
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        <RefreshCw size={14} />
        Refresh Data
      </button>
    </div>
  );

  const renderLoadingState = (text) => (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
      <ContentLoader
        state={true}
        loading={true}
        loadingText={text}
        loadedText=""
        color="#1976d2"
        size={isMobile ? "small" : "medium"}
      />
    </div>
  );

  const renderActiveTable = () => {
    switch (activeView) {
      case "businesses":
        if (data.businesses.length === 0) {
          return renderEmptyState(Building2, "businesses", fetchBusinesses);
        }
        return (
          <div className="overflow-x-auto">
            <BusinessTable
              filteredBusinesses={data.businesses}
              selectedItems={[]}
              setSelectedItems={() => {}}
              toggleSelectAll={() => {}}
              toggleSelectItem={() => {}}
              openModalForEdit={() => {}}
              openEnableView={() => {}}
              openEnableModal={() => {}}
              openDisableModal={() => {}}
              openDeleteModal={() => {}}
              isMobile={isMobile}
            />
          </div>
        );

      case "admins":
        if (data.users.length === 0) {
          return renderEmptyState(Users, "users", fetchUsers);
        }
        return (
          <div className="overflow-x-auto">
            <UsersTable filteredUsers={data.users} isMobile={isMobile} />
          </div>
        );

      case "transactions":
        if (data.transactions.length === 0) {
          return renderEmptyState(Receipt, "transactions", fetchTransactions);
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

  const renderActiveComponent = () => {
    if (loading.kpi && activeView === null) {
      return renderLoadingState("Loading dashboard...");
    }

    const viewLoadingStates = {
      businesses: loading.businesses,
      admins: loading.users,
      transactions: loading.transactions,
      revenue: loading.revenue,
    };

    if (activeView && viewLoadingStates[activeView]) {
      return renderLoadingState(`Loading ${activeView}...`);
    }

    if (activeView === null) {
      return <RevenueChart businesses={data.businesses} isMobile={isMobile} />;
    }

    return renderActiveTable();
  };

  const tabs = [
    { id: null, label: "Overview" },
    { id: "businesses", label: "Businesses" },
    { id: "admins", label: "Users" },
    { id: "transactions", label: "Transactions" },
    { id: "revenue", label: "Revenue" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={(open) => setToaster({ ...toaster, open })}
        position={toaster.position}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Super Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Overview of platform performance and analytics
              </p>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading.kpi}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-fit"
          >
            <RefreshCw
              size={15}
              className={loading.kpi ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        <div className="mb-6 sm:mb-8">
          {loading.kpi ? (
            <KPICardsSkeleton />
          ) : (
            <KPICards
              data={data.kpiData}
              onCardClick={handleCardClick}
              activeView={activeView}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-1 overflow-x-auto px-3 sm:px-4 pt-3 border-b border-gray-100">
            {tabs.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveView(tab.id)}
                  className="relative px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
                  style={{ color: isActive ? primaryColor : "#6B7280" }}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6">{renderActiveComponent()}</div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
