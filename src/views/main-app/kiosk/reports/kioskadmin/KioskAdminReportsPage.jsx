// kiosk-admin/KioskAdminReportsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MoreVertical,
  Trophy,
  Star,

} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts";

// Import API services
import URLS from "../../../../../utilities/Endpoints";
import { GET } from "../../../../../services/DatabaseServiceImp";
import ContentLoader from "../../../../../components/Loader/ContentLoader.jsx";
import { useTheme } from "../../../../../components/theme/ThemeContext.jsx";

// Import components
import ReportHeader from "./ReportHeader";
import ReportControls from "./ReportControls";
import ReportStats from "./ReportStats";
import SalesDashboard from "./SalesDashboard";
import ProductsDashboard from "./ProductsDashboard";
import DebtManagement from "../../debtmanagement";
import StaffDashboard from "./StaffDashboard";

// Import date utilities
import { getDateRange as getDateRangeUtil } from "../../../../../utilities/Sharedfunctions.jsx";

// Helper functions
const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#EF4444", "#06B6D4", "#84CC16"];

const getInitials = (name) => {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

// Enhanced getDateRange function with more options
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case '2weeks':
      start.setDate(now.getDate() - 14);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case '60days':
      start.setDate(now.getDate() - 60);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    date: now.toISOString().split('T')[0]
  };
};

export default function KioskAdminReportsPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.value);
  const token = localStorage.getItem('token');

  // States
  const [activeTab, setActiveTab] = useState(0);
  const [tabChanging, setTabChanging] = useState(false); // NEW: Track tab changes

  // Initialize selectedDateRange with today's date by default
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return {
      startDate: `${day}-${month}-${year}`,
      endDate: `${day}-${month}-${year}`
    };
  });

  const [selectedFilters, setSelectedFilters] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]); // ADDED: Filtered transactions state

  const [loading, setLoading] = useState({
    sales: true,
    products: true,
    debts: true,
    staff: true,
    overview: true
  });

  // New loading state for tab switching
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationLoadingText, setOperationLoadingText] = useState("");

  const [contentLoaded, setContentLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(false);

  // Data states
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    previousRevenue: 0,
    transactionCount: 0,
    previousTransactions: 0,
    paymentMethods: [],
    dailyTrend: []
  });

  const [productData, setProductData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [kioskStats, setKioskStats] = useState({});
  const [inventoryData, setInventoryData] = useState({});
  const [userData, setUserData] = useState({
    user: null,
    businessId: null,
    kioskId: null,
    initialized: false
  });
  const todayStr = useMemo(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const theme = useTheme();
  // Filter options for different tabs
  const filterOptions = {
    sales: [
      { label: "Completed", value: "completed" },
      { label: "Pending", value: "pending" },
      { label: "Failed", value: "failed" },
      { label: "Refunded", value: "refunded" },
      { label: "Cash", value: "cash" },
      { label: "Mpesa", value: "mpesa" },
      { label: "Card", value: "card" }
    ],
    products: [
      { label: "Low Stock", value: "low_stock" },
      { label: "Out of Stock", value: "out_of_stock" },
      { label: "Best Selling", value: "best_selling" },
      { label: "By Category", value: "by_category" }
    ],
    staff: [
      { label: "Top Performers", value: "top_performers" },
      { label: "By Rating", value: "by_rating" },
      { label: "Recent Activity", value: "recent_activity" }
    ]
  };

  // Get current filter options based on active tab
  const getCurrentFilterOptions = () => {
    switch (activeTab) {
      case 0: // Sales Dashboard
        return filterOptions.sales;
      case 1: // Product Analytics
        return filterOptions.products;
      case 3: // Staff Performance
        return filterOptions.staff;
      default:
        return [];
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'KSh 0';
    return `KSh ${parseFloat(amount).toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(1));
  };

  // Modified setActiveTab function to handle loading
  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return; // Don't do anything if clicking same tab

    setTabChanging(true);
    setOperationLoading(true);

    const tabNames = {
      0: "Sales Dashboard",
      1: "Product Analytics",
      2: "Debt Management",
      3: "Staff Performance"
    };

    setOperationLoadingText(`Loading ${tabNames[tabId] || 'data'}...`);

    // Set timeout to hide loading after a short delay
    setTimeout(() => {
      setActiveTab(tabId);
      setOperationLoading(false);
      setTabChanging(false);
    }, 300);
  };

  const fetchTransactions = async (businessId, filters = {}) => {
    try {
      let url = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS
        .replace(':businessId', businessId);

      const queryParams = new URLSearchParams();

      // Set date filters only if provided
      if (filters.startDate) {
        console.log('📅 Using startDate filter:', filters.startDate);
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        console.log('📅 Using endDate filter:', filters.endDate);
        queryParams.append('endDate', filters.endDate);
      }

      // Set status filters if any
      if (selectedFilters.length > 0) {
        console.log('🎯 Applying filters to API call:', selectedFilters);
        const statusFilters = selectedFilters.filter(f =>
          ['completed', 'pending', 'failed', 'refunded'].includes(f)
        );
        if (statusFilters.length > 0) {
          queryParams.append('status', statusFilters.join(','));
        }

        const paymentFilters = selectedFilters.filter(f =>
          ['cash', 'mpesa', 'card'].includes(f)
        );
        if (paymentFilters.length > 0) {
          queryParams.append('paymentMethod', paymentFilters.join(','));
        }
      }

      if (filters.limit) queryParams.append('limit', filters.limit);

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      console.log('🔍 Fetching transactions from URL:', url);
      const response = await GET(url);
      const transactionsData = response.data || response.transactions || response || [];

      console.log(`✅ Got ${transactionsData.length} transactions`);
      return transactionsData;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  const fetchProducts = async (businessId, filters = {}) => {
    try {
      let url = URLS.PRODUCTS.GET_PRODUCTS_BY_BUSINESS
        .replace(':businessId', businessId);

      const queryParams = new URLSearchParams();

      // Apply selected filters
      if (selectedFilters.includes('low_stock')) {
        queryParams.append('lowStock', 'true');
      }
      if (selectedFilters.includes('out_of_stock')) {
        queryParams.append('outOfStock', 'true');
      }

      if (filters.category) queryParams.append('category', filters.category);
      if (filters.best_selling) queryParams.append('sort', '-soldQuantity');

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await GET(url);
      return response.data || response.products || response || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  const fetchDailyReport = async (businessId, dateRange, customRange = null) => {
    try {
      let url = URLS.TRANSACTIONS.GET_DAILY_REPORT_BY_BUSINESS
        .replace(':businessId', businessId)
        .replace(':date', dateRange.date || new Date().toISOString().split('T')[0]);

      const queryParams = new URLSearchParams();

      if (customRange?.start && customRange?.end) {
        queryParams.append('start', customRange.start);
        queryParams.append('end', customRange.end);
      } else if (dateRange.start && dateRange.end) {
        queryParams.append('start', dateRange.start);
        queryParams.append('end', dateRange.end);
      }

      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      const response = await GET(url);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching daily report:", error);
      return null;
    }
  };

  // Process and calculate sales data from transactions
  const processSalesData = (transactions, period) => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        totalRevenue: 0,
        transactionCount: 0,
        paymentMethods: [],
        dailyTrend: []
      };
    }

    // Filter completed transactions for revenue calculation
    const completedTransactions = transactions.filter(t =>
      t.status?.toLowerCase() === 'completed'
    );

    // Calculate total revenue
    const totalRevenue = completedTransactions.reduce((sum, t) =>
      sum + (parseFloat(t.totalAmount) || 0), 0
    );

    // Calculate transaction count
    const transactionCount = transactions.length;

    // Calculate payment methods distribution
    const paymentMethodsMap = {};
    completedTransactions.forEach(t => {
      const method = t.paymentMethod?.toLowerCase() || 'cash';
      if (!paymentMethodsMap[method]) {
        paymentMethodsMap[method] = {
          amount: 0,
          count: 0,
          method: method.charAt(0).toUpperCase() + method.slice(1)
        };
      }
      paymentMethodsMap[method].amount += parseFloat(t.totalAmount) || 0;
      paymentMethodsMap[method].count += 1;
    });

    const paymentMethods = Object.values(paymentMethodsMap).map((method, index) => ({
      ...method,
      color: method.method === 'Cash' ? '#10B981' :
        method.method === 'Mpesa' ? '#3B82F6' :
          method.method === 'Card' ? '#8B5CF6' :
            COLORS[index % COLORS.length]
    }));

    // Create daily trend data
    const daysToShow = period === 'today' || period === 'yesterday' ? 1 :
      period === 'week' ? 7 :
        period === '2weeks' ? 14 :
          period === 'month' ? 30 :
            period === '60days' ? 60 : 30;

    // Initialize days array
    const dailyTrendMap = {};
    const today = new Date();

    // If period is today, just show today
    if (period === 'today') {
      const dateKey = today.toISOString().split('T')[0];
      const dayKey = today.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      dailyTrendMap[dateKey] = {
        day: dayKey,
        revenue: 0,
        transactions: 0,
        fullDate: dateKey
      };
    } else {
      // For other periods, show multiple days
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        const dateKey = date.toISOString().split('T')[0];

        dailyTrendMap[dateKey] = {
          day: dayKey,
          revenue: 0,
          transactions: 0,
          fullDate: dateKey
        };
      }
    }

    // Populate with actual data
    transactions.forEach(t => {
      if (!t.createdAt && !t.timestamp) return;

      const transDate = new Date(t.createdAt || t.timestamp);
      const dateKey = transDate.toISOString().split('T')[0];

      if (dailyTrendMap[dateKey]) {
        dailyTrendMap[dateKey].transactions += 1;
        if (t.status?.toLowerCase() === 'completed') {
          dailyTrendMap[dateKey].revenue += parseFloat(t.totalAmount) || 0;
        }
      }
    });

    const dailyTrend = Object.values(dailyTrendMap);

    return {
      totalRevenue,
      transactionCount,
      paymentMethods,
      dailyTrend,
      averageSale: transactionCount > 0 ? totalRevenue / transactionCount : 0
    };
  };

  // Update the fetchStaffManagementData function in KioskAdminReportsPage.jsx
  const fetchStaffManagementData = async (businessId) => {
    try {
      console.log('🔍 Fetching staff management data for business:', businessId);

      let staffData = [];

      // FIRST: Try to get the current user's info as fallback
      const currentUserInfo = {
        id: currentUser.id || currentUser._id,
        firstName: currentUser.firstName || "Admin",
        lastName: currentUser.lastName || "User",
        email: currentUser.email || "",
        username: currentUser.username || "",
        phone: currentUser.phone || currentUser.phoneNumber || "",
        phoneNumber: currentUser.phoneNumber || currentUser.phone || "",
        role: currentUser.role || "Kiosk_Admin",
        status: 'ACTIVE',
        businessId: businessId,
        associatedBusinessId: businessId,
        institutionId: businessId,
        businessName: userData?.adminInfo?.businessName || "Current Business",
        businessType: userData?.adminInfo?.businessType || "Kiosk",
        dateJoined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        rating: 4.5
      };

      // Try multiple API endpoints
      const endpointsToTry = [
        `/api/users/business/${businessId}`,
        `/api/business/${businessId}/staff`,
        `/api/staff/business/${businessId}`,
        URLS.USERS?.GET_USERS_BY_BUSINESS?.replace(':businessId', businessId),
        URLS.USERS?.GET_ALL_USERS
      ].filter(url => url && typeof url === 'string');

      console.log('🔄 Trying endpoints:', endpointsToTry);

      for (const endpoint of endpointsToTry) {
        try {
          console.log(`📤 Trying endpoint: ${endpoint}`);
          const result = await GET(endpoint);

          console.log(`📥 Endpoint ${endpoint} response:`, result);

          if (result?.success && Array.isArray(result.data)) {
            staffData = result.data;
            console.log(`✅ Got ${staffData.length} staff from ${endpoint}`);
            break;
          } else if (result?.success && Array.isArray(result.staff)) {
            staffData = result.staff;
            console.log(`✅ Got ${staffData.length} staff from ${endpoint}`);
            break;
          } else if (Array.isArray(result)) {
            staffData = result;
            console.log(`✅ Got ${staffData.length} staff from ${endpoint}`);
            break;
          }
        } catch (endpointError) {
          console.log(`ℹ️ Endpoint ${endpoint} failed:`, endpointError.message);
          continue;
        }
      }

      // If still no data, try to filter from all users if we can fetch them
      if (staffData.length === 0 && URLS.USERS?.GET_ALL_USERS) {
        try {
          console.log('🔄 Trying to filter from all users...');
          const allUsersResult = await GET(URLS.USERS.GET_ALL_USERS);

          if (allUsersResult?.success && Array.isArray(allUsersResult.data)) {
            // Filter for users in current business with Kiosk roles
            staffData = allUsersResult.data.filter(user => {
              if (!user) return false;

              const userBusinessId = String(user.businessId || user.associatedBusinessId || user.institutionId || "").trim();
              const targetBusinessId = String(businessId).trim();

              // Check if user belongs to this business
              const belongsToCurrentBusiness =
                userBusinessId === targetBusinessId ||
                (user.businessId && String(user.businessId) === targetBusinessId) ||
                (user.associatedBusinessId && String(user.associatedBusinessId) === targetBusinessId) ||
                (user.institutionId && String(user.institutionId) === targetBusinessId);

              // Check for Kiosk roles
              const hasValidRole = user.role && (
                user.role.startsWith('Kiosk_') ||
                ['Kiosk_Admin', 'Kiosk_Shopkeeper', 'Kiosk_Cashier', 'Kiosk_Manager', 'Admin', 'Manager', 'Cashier', 'Shopkeeper'].includes(user.role)
              );

              return belongsToCurrentBusiness && hasValidRole;
            });

            console.log(`✅ Filtered ${staffData.length} staff from all users`);
          }
        } catch (allUsersError) {
          console.log('ℹ️ Could not fetch all users:', allUsersError.message);
        }
      }

      // CRITICAL: If still no data, use current user as default staff
      if (staffData.length === 0) {
        console.warn('⚠️ No staff data found for business, using current user as default');
        staffData = [currentUserInfo];
      }

      // Transform staff data with proper field mapping
      const transformedStaff = staffData.map(member => {
        const memberId = member._id || member.id || `staff-${Math.random().toString(36).substr(2, 9)}`;
        const memberBusinessId = member.businessId || member.associatedBusinessId || businessId;

        console.log(`🔍 Processing staff member ${memberId}:`, {
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.role,
          businessId: memberBusinessId
        });

        return {
          id: memberId,
          _id: memberId,
          firstName: member.firstName || "Staff",
          lastName: member.lastName || "Member",
          email: member.email || "",
          username: member.username || "",
          phone: member.phone || member.phoneNumber || "",
          phoneNumber: member.phoneNumber || member.phone || "",
          role: member.role || "Kiosk_Staff",
          status: (member.status || 'ACTIVE').toUpperCase(),
          businessId: memberBusinessId,
          associatedBusinessId: member.associatedBusinessId || businessId,
          institutionId: member.institutionId || businessId,
          businessName: userData?.adminInfo?.businessName || "Current Business",
          businessType: userData?.adminInfo?.businessType || "Kiosk",
          dateJoined: member.createdAt || member.dateJoined || new Date().toISOString(),
          lastLogin: member.lastLogin,
          createdAt: member.createdAt,
          rating: member.rating || (3.5 + (Math.random() * 1.5)), // Add rating field
          // Add shopkeeper name for matching with transactions
          shopkeeperName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
          fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim()
        };
      });

      console.log('✅ Transformed staff management data:', transformedStaff.length);
      console.log('📊 First transformed staff:', transformedStaff[0]);

      return transformedStaff;

    } catch (error) {
      console.error('❌ Error fetching staff management data:', error);
      // Return at least the current user as staff
      return [{
        id: currentUser.id || currentUser._id || `default-${Date.now()}`,
        _id: currentUser.id || currentUser._id || `default-${Date.now()}`,
        firstName: currentUser.firstName || "Admin",
        lastName: currentUser.lastName || "User",
        email: currentUser.email || "",
        username: currentUser.username || "",
        phone: currentUser.phone || currentUser.phoneNumber || "",
        phoneNumber: currentUser.phoneNumber || currentUser.phone || "",
        role: currentUser.role || "Kiosk_Admin",
        status: 'ACTIVE',
        businessId: businessId,
        associatedBusinessId: businessId,
        institutionId: businessId,
        businessName: userData?.adminInfo?.businessName || "Current Business",
        businessType: userData?.adminInfo?.businessType || "Kiosk",
        dateJoined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        rating: 4.5,
        shopkeeperName: `${currentUser.firstName || 'Admin'} ${currentUser.lastName || 'User'}`.trim(),
        fullName: `${currentUser.firstName || 'Admin'} ${currentUser.lastName || 'User'}`.trim()
      }];
    }
  };

  // Helper function to filter transactions locally
  const filterTransactionsLocally = (allTrans, dateRange, filters) => {
    let filtered = [...allTrans];

    // Apply date range filter
    if (dateRange) {
      try {
        const [startDay, startMonth, startYear] = dateRange.startDate.split('-');
        const [endDay, endMonth, endYear] = dateRange.endDate.split('-');

        const startDate = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);
        const endDate = new Date(`${endYear}-${endMonth}-${endDay}T23:59:59.999`);

        filtered = filtered.filter(transaction => {
          if (!transaction.createdAt && !transaction.timestamp) return false;

          const transDate = new Date(transaction.createdAt || transaction.timestamp || transaction.date);
          if (isNaN(transDate.getTime())) return false;

          return transDate >= startDate && transDate <= endDate;
        });
      } catch (dateError) {
        console.error('❌ Error parsing date range:', dateError);
      }
    }

    // Apply status and payment filters
    if (filters.length > 0) {
      filtered = filtered.filter(transaction => {
        // Status filters
        const statusFilters = filters.filter(f =>
          ['completed', 'pending', 'failed', 'refunded'].includes(f)
        );

        // Payment method filters
        const paymentFilters = filters.filter(f =>
          ['cash', 'mpesa', 'card'].includes(f)
        );

        // Check status
        let statusMatch = true;
        if (statusFilters.length > 0) {
          const transactionStatus = transaction.status?.toLowerCase() || '';
          statusMatch = statusFilters.some(filter =>
            transactionStatus.includes(filter)
          );
        }

        // Check payment method
        let paymentMatch = true;
        if (paymentFilters.length > 0) {
          const transactionPayment = transaction.paymentMethod?.toLowerCase() || 'cash';
          paymentMatch = paymentFilters.some(filter =>
            transactionPayment.includes(filter)
          );
        }

        return statusMatch && paymentMatch;
      });
    }

    return filtered;
  };

  const fetchDashboardData = async () => {
    if (!userData.businessId || !userData.initialized) {
      console.log('❌ Cannot fetch: Missing businessId or user not initialized');
      return;
    }

    console.log('🚀 fetchDashboardData called with:', {
      businessId: userData.businessId,
      selectedDateRange,
      selectedFilters,
      todayStr
    });

    setError(null);
    setOperationLoading(true);
    setOperationLoadingText("Loading dashboard data...");

    try {
      setLoading({
        sales: true,
        products: true,
        debts: true,
        staff: true,
        overview: true
      });

      // FIRST: Fetch ALL transactions for the business with NO date filters initially
      console.log('📥 Fetching ALL transactions...');
      const allTransactions = await fetchTransactions(userData.businessId, {
        // IMPORTANT: Don't pass startDate/endDate here to get ALL transactions
        limit: 5000  // Increase limit to get more data
      });

      console.log(`✅ Got ${allTransactions.length} total transactions`);
      setTransactions(allTransactions);

      // SECOND: Filter transactions locally based on selected date range and filters
      const filtered = filterTransactionsLocally(allTransactions, selectedDateRange, selectedFilters);
      console.log(`📊 Filtered to ${filtered.length} transactions`);
      setFilteredTransactions(filtered);

      // THIRD: Determine what date range to use (default to today if none selected)
      let effectiveDateRange = selectedDateRange;

      // If no date range is selected, default to today
      if (!selectedDateRange || (!selectedDateRange.startDate && !selectedDateRange.endDate)) {
        effectiveDateRange = {
          startDate: todayStr,
          endDate: todayStr
        };
        console.log('📅 No date range selected, defaulting to today:', effectiveDateRange);
      }

      // Determine period for trend calculation
      const isToday = effectiveDateRange.startDate === todayStr &&
        effectiveDateRange.endDate === todayStr;
      const period = isToday ? 'today' : 'custom';

      console.log(`📈 Period determined: ${period} (isToday: ${isToday})`);

      // Process sales data from FILTERED transactions
      const processedSalesData = processSalesData(filtered, period);
      console.log('💰 Processed sales data:', {
        totalRevenue: processedSalesData.totalRevenue,
        transactionCount: processedSalesData.transactionCount
      });

      // Fetch previous period data for growth calculation
      let previousPeriodData = { totalRevenue: 0, transactionCount: 0 };

      if (effectiveDateRange) {
        // Calculate previous period dates based on filtered period
        const [startDay, startMonth, startYear] = effectiveDateRange.startDate.split('-');
        const [endDay, endMonth, endYear] = effectiveDateRange.endDate.split('-');
        const start = new Date(`${startYear}-${startMonth}-${startDay}`);
        const end = new Date(`${endYear}-${endMonth}-${endDay}`);
        end.setHours(23, 59, 59, 999);

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Get previous period transactions
        const prevStart = new Date(start);
        const prevEnd = new Date(end);
        prevStart.setDate(prevStart.getDate() - diffDays);
        prevEnd.setDate(prevEnd.getDate() - diffDays);

        // Format dates for API
        const prevStartStr = prevStart.toISOString().split('T')[0];
        const prevEndStr = prevEnd.toISOString().split('T')[0];

        console.log('📅 Fetching previous period data:', {
          prevStart: prevStartStr,
          prevEnd: prevEndStr,
          diffDays
        });

        // Fetch previous period transactions
        const prevTransactions = await fetchTransactions(userData.businessId, {
          startDate: prevStartStr,
          endDate: prevEndStr,
          limit: 1000
        });

        // Apply the same filters to previous period transactions
        let filteredPrevTransactions = filterTransactionsLocally(prevTransactions, effectiveDateRange, selectedFilters);

        const prevSalesData = processSalesData(filteredPrevTransactions, period);
        previousPeriodData = {
          totalRevenue: prevSalesData.totalRevenue,
          transactionCount: prevSalesData.transactionCount
        };
      }

      // Update sales data with current and previous period
      setSalesData({
        ...processedSalesData,
        previousRevenue: previousPeriodData.totalRevenue,
        previousTransactions: previousPeriodData.transactionCount
      });

      setLoading(prev => ({ ...prev, sales: false }));

      // Fetch product data
      const products = await fetchProducts(userData.businessId);

      // In fetchDashboardData function, update the product processing section:
      const processedProducts = products && Array.isArray(products)
        ? products.map(product => {
          const soldQuantity = product.soldQuantity || product.quantitySold || 0;
          const sellingPrice = parseFloat(product.sellingPrice) || parseFloat(product.price) || 0;
          const stock = product.currentStock || product.stock || product.quantity || 0;

          // FIXED: Get cost price from product data
          const costPrice = parseFloat(product.costPrice) || 0;

          // Calculate revenue and profit
          const revenue = soldQuantity * sellingPrice;
          const totalCost = soldQuantity * costPrice;
          const profit = revenue - totalCost;

          return {
            id: product._id || product.id,
            name: product.name || `Product ${product._id}`,
            quantitySold: soldQuantity,
            revenue: revenue,
            stock: stock,
            category: product.category || 'Uncategorized',
            sellingPrice: sellingPrice,
            costPrice: costPrice, // Pass cost price to child
            profit: profit,
            // Add other fields that might be needed
            sku: product.sku || product.code || 'N/A',
            unit: product.unit || 'units',
            threshold: parseFloat(product.threshold) || 10,
            buyingPrice: parseFloat(product.buyingPrice) || 0,
            purchasePrice: parseFloat(product.purchasePrice) || 0,
            wholesalePrice: parseFloat(product.wholesalePrice) || 0
          };
        }).filter(p => p.name && p.sellingPrice > 0)
        : [];

      setProductData(processedProducts);
      setLoading(prev => ({ ...prev, products: false }));

      // Fetch staff management data
      try {
        const staffManagementData = await fetchStaffManagementData(userData.businessId);
        setStaffData(staffManagementData);
        setLoading(prev => ({ ...prev, staff: false }));
      } catch (staffError) {
        console.error('Error fetching staff management data:', staffError);
        setLoading(prev => ({ ...prev, staff: false }));
      }

      // Calculate kiosk stats
      const totalInventoryValue = processedProducts.reduce((sum, p) => sum + (p.stock * (p.costPrice || p.sellingPrice * 0.7)), 0);
      const totalProfit = processedProducts.reduce((sum, p) => sum + p.profit, 0);
      const profitMargin = processedSalesData.totalRevenue > 0 ? (totalProfit / processedSalesData.totalRevenue) * 100 : 0;

      const uniqueCustomers = new Set();
      filtered?.forEach(t => {
        if (t.customerName) uniqueCustomers.add(t.customerName);
        if (t.customerPhone) uniqueCustomers.add(t.customerPhone);
      });

      const targetProgress = processedSalesData.totalRevenue > 0
        ? Math.min(Math.round((processedSalesData.totalRevenue / 1000000) * 100), 100)
        : 0;

      setKioskStats({
        activeCustomers: uniqueCustomers.size,
        inventoryValue: totalInventoryValue,
        profitMargin: parseFloat(profitMargin.toFixed(1)),
        targetProgress: targetProgress
      });

      const lowStockItems = processedProducts.filter(p => p.stock > 0 && p.stock < 20).length;
      const outOfStockItems = processedProducts.filter(p => p.stock <= 0).length;

      setInventoryData({
        totalValue: totalInventoryValue,
        lowStockItems,
        outOfStockItems,
        totalItems: processedProducts.length
      });

      setLoading(prev => ({ ...prev, overview: false }));
      setContentLoaded(true);
      setOperationLoading(false);

    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      setError(`Failed to load dashboard data: ${err.message}`);

      setLoading({
        sales: false,
        products: false,
        debts: false,
        staff: false,
        overview: false
      });
      setContentLoaded(true);
      setOperationLoading(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (dateRange) => {
    setSelectedDateRange(dateRange);
    setOperationLoading(true);
    setOperationLoadingText("Applying date range...");

    // Clear any existing date filters from localStorage
    localStorage.removeItem("dateFilter");
    localStorage.removeItem("dateFilterCustom");

    // Fetch data with new date range
    if (userData.initialized) {
      if (transactions.length > 0) {
        // Filter locally if we already have transactions
        const filtered = filterTransactionsLocally(transactions, dateRange, selectedFilters);
        setFilteredTransactions(filtered);

        // Update sales data
        const isToday = dateRange?.startDate === todayStr &&
          dateRange?.endDate === todayStr;
        const period = isToday ? 'today' : 'custom';

        const processedSalesData = processSalesData(filtered, period);
        setSalesData(prev => ({
          ...prev,
          ...processedSalesData,
          transactionCount: filtered.length,
          totalRevenue: processedSalesData.totalRevenue
        }));

        setTimeout(() => {
          setOperationLoading(false);
        }, 500);
      } else {
        // Otherwise fetch fresh data
        fetchDashboardData();
      }
    }
  };

  // Handle filter change
  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setOperationLoading(true);
    setOperationLoadingText("Applying filters...");

    // If we already have transactions, filter them locally
    if (transactions.length > 0 && userData.initialized) {
      console.log('🎯 Applying new filters to existing transactions:', filters);

      const filtered = filterTransactionsLocally(transactions, selectedDateRange, filters);
      setFilteredTransactions(filtered);

      // Update sales data
      const isToday = selectedDateRange?.startDate === todayStr &&
        selectedDateRange?.endDate === todayStr;
      const period = isToday ? 'today' : 'custom';

      const processedSalesData = processSalesData(filtered, period);
      setSalesData(prev => ({
        ...prev,
        ...processedSalesData,
        transactionCount: filtered.length,
        totalRevenue: processedSalesData.totalRevenue
      }));

      setTimeout(() => {
        setOperationLoading(false);
      }, 500);
    } else {
      // Otherwise fetch fresh data
      fetchDashboardData();
    }
  };

  // Handle view transaction
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleExport = async (format) => {
    try {
      let exportData = {};
      let exportType = "";

      switch (activeTab) {
        case 0:
          exportData = {
            salesData,
            transactions: filteredTransactions.slice(0, 100),
            dateRange: selectedDateRange,
            filters: selectedFilters,
            generatedAt: new Date().toISOString()
          };
          exportType = "sales";
          break;
        case 1:
          exportData = productData;
          exportType = "products";
          break;
        case 3:
          exportData = staffData;
          exportType = "staff";
          break;
        default:
          alert("Export not available for this tab");
          return;
      }

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportType}_report_${selectedDateRange ? 'custom' : 'today'}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export report. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const refreshData = () => {
    setContentLoaded(false);
    setLoading({
      sales: true,
      products: true,
      debts: true,
      staff: true,
      overview: true
    });
    setOperationLoading(true);
    setOperationLoadingText("Refreshing data...");
    fetchDashboardData();
  };

  // Effects
  useEffect(() => {
    if (!currentUser || !token) {
      navigate('/login');
      return;
    }

    const businessId = currentUser.businessId ||
      currentUser.businessID ||
      localStorage.getItem('businessId') ||
      sessionStorage.getItem('businessId');

    const kioskId = currentUser.kioskId ||
      currentUser.kioskID ||
      localStorage.getItem('kioskId') ||
      sessionStorage.getItem('kioskId');

    if (!businessId) {
      setError("No business assigned to your account. Please contact administrator.");
      setAuthChecked(true);
      return;
    }

    setUserData({
      user: currentUser,
      businessId,
      kioskId,
      adminInfo: {
        businessId,
        kioskId,
        businessName: currentUser.businessName || "Business",
        businessType: currentUser.businessType || "Retail"
      },
      initialized: true
    });

    setAuthChecked(true);

  }, [currentUser, token, navigate]);

  // Fetch data when component mounts or when user data changes
  useEffect(() => {
    if (userData.initialized && authChecked) {
      fetchDashboardData();
    }
  }, [userData.initialized, authChecked]);

  // Handle refetch when selectedDateRange changes
  useEffect(() => {
    if (userData.initialized && selectedDateRange) {
      // We'll handle this in handleDateRangeChange
    }
  }, [selectedDateRange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!contentLoaded && Object.values(loading).some(l => l)) {
        setContentLoaded(true);
        setLoading({
          sales: false,
          products: false,
          debts: false,
          staff: false,
          overview: false
        });
        setOperationLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [contentLoaded, loading]);

  // Calculate derived values for sales
  const revenueGrowth = calculateGrowth(salesData.totalRevenue, salesData.previousRevenue);
  const transactionGrowth = calculateGrowth(salesData.transactionCount, salesData.previousTransactions);

  const tabs = [
    { id: 0, label: "Sales Dashboard", icon: <BarChart3 size={18} /> },
    { id: 1, label: "Product Analytics", icon: <Package size={18} /> },
    { id: 2, label: "Debt Management", icon: <CreditCard size={18} /> },
    { id: 3, label: "Staff Performance", icon: <Users size={18} /> },
  ];

  // ===== CONTENT LOADER INTEGRATION =====
  // Show ContentLoader when operationLoading is true
  if (operationLoading || tabChanging) {
    return (
      <div className="min-h-screen bg-white">
        {/* Container that becomes full width only on small devices */}
        <div className="w-full sm:w-auto md:w-auto lg:w-auto">
          <div className="main-app-view w-full sm:w-auto">
            <div className="main-app-content-container w-full sm:w-auto min-h-[200px] sm:min-h-auto">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={operationLoadingText || "Loading dashboard..."}
                loadedText=""
                color="#3B82F6"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial loading state
  if (!authChecked || (!contentLoaded && loading.overview)) {
    return (
      <div className="min-h-screen bg-white">
        {/* Container that becomes full width only on small devices */}
        <div className="w-full sm:w-auto md:w-auto lg:w-auto">
          <div className="main-app-view w-full sm:w-auto">
            <div className="main-app-content-container w-full sm:w-auto min-h-[200px] sm:min-h-auto">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={operationLoadingText || "Loading dashboard..."}
                loadedText=""
                color="#3B82F6"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!userData.user || !userData.businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8">
            <div className="text-red-500 text-xl mb-4">
              {!userData.user ? "User Not Logged In" : "No Business Assigned"}
            </div>
            <div className="text-gray-600 mb-6">
              {!userData.user
                ? "Please log in to access the analytics dashboard."
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

  // StatCard Component
  const StatCard = ({ title, value, growth, icon, color, suffix = "", loading: isLoading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-10`}>
          {icon}
        </div>
        {!isLoading && growth !== undefined && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {growth >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}{suffix}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          {growth !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span>{growth >= 0 ? 'Increase' : 'Decrease'} from previous period</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // LoadingOverlay Component
  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
        <p className="text-gray-600">Loading data...</p>
      </div>
    </div>
  );

  // ErrorAlert Component
  const ErrorAlert = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{message}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // Render
  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <ReportHeader
        userData={userData}
        refreshData={refreshData}
        loading={loading.overview}
        error={error}
        ErrorAlert={ErrorAlert}
      />

      {/* Error Display */}
      {error && <ErrorAlert message={error} onRetry={refreshData} />}

      {/* Control Panel */}
      <ReportControls
        activeTab={activeTab}
        setActiveTab={handleTabChange}  // Use the new handler
        tabs={tabs}
        loading={loading.overview}
        handleExport={handleExport}
        handlePrint={handlePrint}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={handleDateRangeChange}
        filterOptions={getCurrentFilterOptions()}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Quick Stats Bar */}
      <ReportStats
        kioskStats={kioskStats}
        inventoryData={inventoryData}
        loading={loading.overview}
        formatCurrency={formatCurrency}
      />

      {/* Main Content */}
      {contentLoaded ? (
        <div className="space-y-8">
          {/* Tab 1: Sales Dashboard */}
          {activeTab === 0 && (
            <SalesDashboard
              salesData={salesData}
              loading={loading.sales}
              revenueGrowth={revenueGrowth}
              transactionGrowth={transactionGrowth}
              formatCurrency={formatCurrency}
              StatCard={StatCard}
              LoadingOverlay={LoadingOverlay}
              RechartsTooltip={RechartsTooltip}
              BarChart={BarChart}
              Bar={Bar}
              XAxis={XAxis}
              YAxis={YAxis}
              CartesianGrid={CartesianGrid}
              ResponsiveContainer={ResponsiveContainer}
              PieChart={PieChart}
              Pie={Pie}
              Cell={Cell}
              Legend={Legend}
              AreaChart={AreaChart}
              Area={Area}
              Line={Line}
              COLORS={COLORS}
              userData={userData}
              selectedDateRange={selectedDateRange}
              selectedFilters={selectedFilters}
              transactions={transactions}
              filteredTransactions={filteredTransactions}
              onViewTransaction={handleViewTransaction}
              onRefresh={refreshData}
              onDateRangeChange={handleDateRangeChange}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Tab 2: Product Analytics */}
          {activeTab === 1 && (
            <ProductsDashboard
              productData={productData}
              loading={loading.products}
              formatCurrency={formatCurrency}
              LoadingOverlay={LoadingOverlay}
              RechartsTooltip={RechartsTooltip}
              BarChart={BarChart}
              Bar={Bar}
              XAxis={XAxis}
              YAxis={YAxis}
              CartesianGrid={CartesianGrid}
              ResponsiveContainer={ResponsiveContainer}
              Package={Package}
              AlertTriangle={AlertTriangle}
              CheckCircle={CheckCircle}
              userData={userData}
              selectedDateRange={selectedDateRange}
              selectedFilters={selectedFilters}
              onDateRangeChange={handleDateRangeChange}
              onFilterChange={handleFilterChange}
              onRefresh={refreshData}
              filteredTransactions={filteredTransactions}
            />

          )}

          {/* Tab 3: Debt Management */}
          {activeTab === 2 && (
            <div className="mt-6">
              <DebtManagement />
            </div>
          )}

          {/* Tab 4: Staff Performance */}
          {activeTab === 3 && (
            <StaffDashboard
              staffData={staffData}
              loading={loading.staff}
              formatCurrency={formatCurrency}
              getInitials={getInitials}
              LoadingOverlay={LoadingOverlay}
              Star={Star}
              MoreVertical={MoreVertical}
              Users={Users}
              Trophy={Trophy}
              RechartsTooltip={RechartsTooltip}
              LineChart={LineChart}
              Line={Line}
              CartesianGrid={CartesianGrid}
              XAxis={XAxis}
              YAxis={YAxis}
              ResponsiveContainer={ResponsiveContainer}
              isToday={!selectedDateRange || (
                selectedDateRange.startDate === selectedDateRange.endDate &&
                selectedDateRange.startDate === todayStr
              )}
              // ===== CRITICAL ADDITIONS =====
              filteredTransactions={filteredTransactions}
              onRefresh={refreshData}
              onDateRangeChange={handleDateRangeChange}
              onFilterChange={handleFilterChange}
              selectedDateRange={selectedDateRange}
              selectedFilters={selectedFilters}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading dashboard data...</p>
          <button
            onClick={() => {
              setContentLoaded(true);
              setLoading({
                sales: false,
                products: false,
                debts: false,
                staff: false,
                overview: false
              });
            }}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Show demo data
          </button>
        </div>
      )}
    </div>
  );
}