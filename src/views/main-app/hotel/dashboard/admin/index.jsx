import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button } from "@mui/material"; // Added Button to imports
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Import the new components
import KpiCard from "./KpiCard";
import RevenueChartCard from "./RevenueChartCard";
import OrdersByCategoryChartCard from "./OrdersByCategoryChartCard";
import RecentOrdersTable from "./recentOrdersTable";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import SearchInput from "../../../../../components/Input/SearchInput";
import dayjs from "dayjs";

// --- Sample Data (updated to include 'date' property) ---
const revenueDataDaily = [
  { name: "Mon", value: 4200 },
  { name: "Tue", value: 3800 },
  { name: "Wed", value: 5100 },
  { name: "Thu", value: 4700 },
  { name: "Fri", value: 6200 },
  { name: "Sat", value: 7800 },
  { name: "Sun", value: 7200 },
];

const revenueDataMonthly = [
  { name: "Jan", value: 150000 },
  { name: "Feb", value: 145000 },
  { name: "Mar", value: 160000 },
  { name: "Apr", value: 155000 },
  { name: "May", value: 170000 },
  { name: "Jun", value: 185000 },
  { name: "Jul", value: 175000 },
];

const ordersByCategoryData = [
  { name: "Food", value: 67 },
  { name: "Beverage", value: 33 },
];

const recentOrders = [
  {
    id: "ORD-5678",
    waiter: "John Smith",
    amount: 12450, // Changed to number for easier formatting
    date: "2025-07-24", // Added date
    time: "12:45:00", // Added seconds for consistency with format
    status: "Completed",
    foodItems: ["Ugali & Sukuma", "Chapati & Ndengu"],
  },
  {
    id: "ORD-5677",
    waiter: "Sarah Lee",
    amount: 7825,
    date: "2025-07-24", // Added date
    time: "12:30:00", // Added seconds
    status: "In Progress",
    foodItems: ["Mokimo", "Kienyeji Chicken"],
  },
  {
    id: "ORD-5676",
    waiter: "Mike Chen",
    amount: 9500,
    date: "2025-07-23", // Added date
    time: "17:15:00", // Added seconds
    status: "Completed",
    foodItems: ["Pilau Beef", "Fresh Juice"],
  },
  {
    id: "ORD-5675",
    waiter: "Lisa Johnson",
    amount: 4375,
    date: "2025-07-23", // Added date
    time: "11:50:00", // Added seconds
    status: "Completed",
    foodItems: ["Fish Fry", "Fries"],
  },
  {
    id: "ORD-56776",
    waiter: "Lisa Johnson",
    amount: 4375,
    date: "2025-07-23", // Added date
    time: "11:50:00", // Added seconds
    status: "Completed",
    foodItems: ["Fish Fry", "Fries"],
  },
  {
    id: "ORD-5685",
    waiter: "Lisa Johnson",
    amount: 4375,
    date: "2025-07-23", // Added date
    time: "11:50:00", // Added seconds
    status: "Completed",
    foodItems: ["Fish Fry", "Fries"],
  },
  {
    id: "ORD-5674",
    waiter: "Robert Davis",
    amount: 11280,
    date: "2025-07-22", // Added date
    time: "09:30:00", // Added seconds
    status: "Completed",
    foodItems: ["Nyama Choma", "Samosa"],
  },
];

function HotelAdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [revenueChartData, setRevenueChartData] = useState(revenueDataDaily);
  const [revenueDateRange, setRevenueDateRange] = useState("7_days");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null); // This will hold { startDate, endDate } from DateInput
  const [dateAnchorEl, setDateAnchorEl] = useState(null);

  // Filter recent orders based on search and date range
  const filteredRecentOrders = useMemo(() => {
    let result = [...recentOrders];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.waiter.toLowerCase().includes(term) ||
          order.foodItems.some((item) => item.toLowerCase().includes(term)) ||
          order.status.toLowerCase().includes(term)
      );
    }

    // Apply date filter if enabled and selectedDates are available
    if (
      dateFilter &&
      selectedDates &&
      selectedDates.startDate &&
      selectedDates.endDate
    ) {
      const { startDate, endDate } = selectedDates;
      result = result.filter((order) => {
        const orderDateTime = dayjs(`${order.date}T${order.time}`);
        // Ensure dayjs objects are created correctly for comparison
        const filterStartDate = dayjs(startDate, "DD-MM-YYYY").startOf("day");
        const filterEndDate = dayjs(endDate, "DD-MM-YYYY").endOf("day");
        return (
          orderDateTime.isAfter(filterStartDate) &&
          orderDateTime.isBefore(filterEndDate)
        );
      });
    }

    return result;
  }, [recentOrders, searchTerm, dateFilter, selectedDates]);

  const handleDateClick = (event) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateFilter = (isFiltered) => {
    setDateFilter(isFiltered);
  };

  // This function receives the { startDate, endDate } object from DateInput
  const handleSelectedDates = (dates) => {
    setSelectedDates(dates);
  };

  // For SearchInput component
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleViewAll = () => {
    setDateFilter(false);
    setSelectedDates(null); // Reset selected dates
    setSearchTerm(""); // Clear search term
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleRevenueDateRangeChange = (event) => {
    const selectedRange = event.target.value;
    setRevenueDateRange(selectedRange);
    if (selectedRange === "7_days") {
      setRevenueChartData(revenueDataDaily);
    } else if (selectedRange === "this_month") {
      setRevenueChartData(revenueDataMonthly);
    } else {
      setRevenueChartData(revenueDataDaily); // Default
    }
  };

  const handleOrderAction = (orderId, actionType) => {
    console.log(`Order ${orderId}: ${actionType} action triggered.`);
    // You'd typically add logic here to handle 'edit' or 'print'
    // e.g., if (actionType === 'edit') { openEditModal(orderId); }
    // else if (actionType === 'print') { initiatePrint(orderId); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 pb-20 ">
      {/* Header and Dynamic Greeting */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          {getGreeting()}, Admin!
        </Typography>
        <Box textAlign="right">
          <Typography variant="subtitle1">{formatDate(currentTime)}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Last updated: {currentTime.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {/* --- KPI Cards - Cover full width --- */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<ShoppingCartIcon />}
            title="Total Orders Today"
            value="142"
            color="#3f51b5"
            trend={{ type: "up", value: 7.2 }}
            onClick={() => console.log("Clicked Total Orders")}
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<AttachMoneyIcon />}
            title="Total Revenue Today"
            value="KSh 8,245"
            color="#f44336"
            trend={{ type: "up", value: 5.1 }}
            onClick={() => console.log("Clicked Total Revenue")}
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<PeopleIcon />}
            title="Active Staff"
            value="18"
            color="#4caf50"
            trend={{ type: "down", value: 1.5 }}
            onClick={() => console.log("Clicked Active Staff")}
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<RestaurantIcon />}
            title="Menu Items Available"
            value="84"
            color="#ff9800"
            onClick={() => console.log("Clicked Menu Items")}
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<WarningIcon />}
            title="Low Stock Alerts"
            value="5"
            color="#e91e63"
            onClick={() => console.log("Navigating to Manage Inventory...")}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-3/4">
          <RevenueChartCard
            data={revenueChartData}
            dateRange={revenueDateRange}
            onDateRangeChange={handleRevenueDateRangeChange}
          />
        </div>

        <div className="w-full md:w-1/4">
          <OrdersByCategoryChartCard data={ordersByCategoryData} />
        </div>
      </div>

   <div className="mb-8">
  <Box
    sx={{
      borderRadius: 2,
      boxShadow: 1,
      padding: 3,
      marginBottom: 2,
    }}
  >
    <Box
      display="flex"
      alignItems="center"
      gap={4}
      mb={2}
    >
      <Box display="flex" alignItems="center" gap={4}>
        <span className="text-xl text-semibold">Recent Orders</span>
        <SearchInput
          id="order-search"
          placeholder="Search orders"
          input={searchTerm}
          handleInput={handleSearchChange}
          handleClear={handleClearSearch}
        />
        <DateRangeInput
          type="orders"
          color="#4F46E5"
          selected={selectedDates}
          dateFilter={dateFilter}
          anchorEl={dateAnchorEl}
          selectedAction={handleSelectedDates}
          handleDateFilter={handleDateFilter}
          handleClose={handleDateClose}
          handleClick={handleDateClick}
        />
      </Box>
    </Box>

    <RecentOrdersTable
      orders={filteredRecentOrders}
      onActionClick={handleOrderAction}
    />
  </Box>
</div>
    </div>
  );
}

export default HotelAdminDashboard;
