// src/views/main-app/reports/super-admin/components/ReportsControls.jsx
import React, { useCallback, useState } from "react";
import SearchInput from "../../../../components/input/SearchInput";
import DateRangeInput from "../../../../components/input/DateRangeInput";
import FilterInput from "../../../../components/input/FilterInput";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { FileText, Table } from "lucide-react";
import { useTheme } from "../../../../components/theme/ThemeContext";
import dayjs from "dayjs";

// Export Libraries
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Helper to format currency
const formatKSh = (amount) => {
  return `KSh ${parseFloat(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const ReportsControls = ({
  dateRange,
  setDateRange,
  filteredTransactions = [],
  selectedTab,
  searchTerm = "",
  onSearchChange,
  filters = {},
  setFilters,
  selectedItems = [],
  setSelectedItems,
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(false);

  const { primaryColor } = useTheme();
  const themeColor = primaryColor || "#1976d2";

  // Search handlers
  const handleSearchInput = (value) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSearchClear = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  // Date range handlers
  const handleDateFilterClick = (event) => {
    setDateFilterAnchorEl(event.currentTarget);
  };

  const handleDateFilterClose = () => {
    setDateFilterAnchorEl(null);
  };

  const handleDateFilter = (isFiltered) => {
    setDateFilter(isFiltered);
  };

  const handleDateSelected = (dateRangeObj) => {
    if (dateRangeObj) {
      setDateRange([dayjs(dateRangeObj.startDate), dayjs(dateRangeObj.endDate)]);
      if (setFilters) {
        setFilters(prev => ({
          ...prev,
          startDate: dateRangeObj.startDate,
          endDate: dateRangeObj.endDate
        }));
      }
    } else {
      setDateRange([null, null]);
      if (setFilters) {
        setFilters(prev => ({
          ...prev,
          startDate: null,
          endDate: null
        }));
      }
    }
  };

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTableFilter = (isFiltered) => {
    setTableFilter(isFiltered);
  };

  // Filter options for reports
  const filterOptions = ['Status', 'Payment Method'];

  const statusFilters = [
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Failed', value: 'Failed' }
  ];

  const paymentMethodFilters = [
    { label: 'M-PESA', value: 'M-PESA' },
    { label: 'Cash', value: 'Cash' },
    { label: 'Debt', value: 'Debt' },
    { label: 'Card', value: 'Card' }
  ];

  // ─── Data preparation for export based on active tab ─────────────────────
  const getExportData = useCallback(() => {
    let dataToExport = [];
    let headers = [];
    let summary = {};
    let fileName = `Biztrack_Report_${dayjs().format("YYYY-MM-DD")}`;

    // Common summary calculations for all reports
    const completedTransactions = filteredTransactions.filter(
      (t) => t?.status === "Completed"
    );
    const totalCommissionEarnedValue = completedTransactions.reduce(
      (sum, t) => sum + (parseFloat(t?.commission) || 0),
      0
    );
    const totalTransactionsValue = completedTransactions.length;

    const totalCommissionEarnedFormatted = formatKSh(totalCommissionEarnedValue);
    const totalTransactionsFormatted = totalTransactionsValue.toLocaleString();

    switch (selectedTab) {
      case 0: { // Revenue Trend
        const dailyData = filteredTransactions.reduce((acc, curr) => {
          const date = curr?.date;
          if (date) {
            acc[date] = (acc[date] || 0) + (parseFloat(curr?.commission) || 0);
          }
          return acc;
        }, {});

        dataToExport = Object.entries(dailyData)
          .map(([date, commission]) => ({
            Date: dayjs(date).format("YYYY-MM-DD"),
            "Daily Commission": commission,
          }))
          .sort((a, b) => dayjs(a.Date).diff(dayjs(b.Date)));

        headers = ["Date", "Daily Commission"];
        summary = {
          title: "Revenue Trend Report",
          "Total Commission": totalCommissionEarnedFormatted,
          "Total Data Points": dataToExport.length,
          "Date Range": dateRange?.[0] && dateRange?.[1]
            ? `${dayjs(dateRange[0]).format("MMM D, YYYY")} - ${dayjs(dateRange[1]).format("MMM D, YYYY")}`
            : "All Dates"
        };
        fileName = `Biztrack_Revenue_Trend_${dayjs().format("YYYY-MM-DD_HHmmss")}`;
        break;
      }

      case 1: { // Transactions
        dataToExport = filteredTransactions.map((t) => ({
          "Transaction ID": t?.id || t?.transactionId || "N/A",
          "Business Name": t?.businessName || t?.business?.name || "N/A",
          "Business Type": t?.businessType || t?.business?.type || "N/A",
          Date: t?.date || t?.createdAt ? dayjs(t.date || t.createdAt).format("YYYY-MM-DD HH:mm") : "N/A",
          "Commission Earned": parseFloat(t?.commission) || 0,
          "Payment Method": t?.paymentMethod || "N/A",
          Status: t?.status || "N/A",
        }));

        headers = [
          "Transaction ID",
          "Business Name",
          "Business Type",
          "Date",
          "Commission Earned",
          "Payment Method",
          "Status",
        ];
        summary = {
          title: "Transactions Report",
          "Total Commission": totalCommissionEarnedFormatted,
          "Total Transactions": totalTransactionsFormatted,
          "Date Range": dateRange?.[0] && dateRange?.[1]
            ? `${dayjs(dateRange[0]).format("MMM D, YYYY")} - ${dayjs(dateRange[1]).format("MMM D, YYYY")}`
            : "All Dates"
        };
        fileName = `Biztrack_Transactions_${dayjs().format("YYYY-MM-DD_HHmmss")}`;
        break;
      }

      case 2: { // Payment Breakdown
        const paymentBreakdown = filteredTransactions.reduce((acc, curr) => {
          const method = curr?.paymentMethod || "Unknown";
          acc[method] = (acc[method] || 0) + (parseFloat(curr?.commission) || 0);
          return acc;
        }, {});

        dataToExport = Object.entries(paymentBreakdown)
          .map(([name, value]) => ({
            "Payment Method": name,
            "Total Commission": value,
          }))
          .sort((a, b) => b["Total Commission"] - a["Total Commission"]);

        headers = ["Payment Method", "Total Commission"];
        summary = {
          title: "Payment Breakdown Report",
          "Total Commission": totalCommissionEarnedFormatted,
          "Date Range": dateRange?.[0] && dateRange?.[1]
            ? `${dayjs(dateRange[0]).format("MMM D, YYYY")} - ${dayjs(dateRange[1]).format("MMM D, YYYY")}`
            : "All Dates"
        };
        fileName = `Biztrack_Payment_Breakdown_${dayjs().format("YYYY-MM-DD_HHmmss")}`;
        break;
      }

      case 3: { // Business Performance
        const businessCommissions = filteredTransactions.reduce((acc, curr) => {
          const businessName = curr?.businessName || curr?.business?.name || "Unknown";
          acc[businessName] = (acc[businessName] || 0) + (parseFloat(curr?.commission) || 0);
          return acc;
        }, {});

        dataToExport = Object.entries(businessCommissions)
          .map(([name, commission]) => ({
            "Business Name": name,
            "Total Commission": commission,
            "Transaction Count": filteredTransactions.filter(t =>
              t?.businessName === name || t?.business?.name === name
            ).length
          }))
          .sort((a, b) => b["Total Commission"] - a["Total Commission"]);

        headers = ["Business Name", "Total Commission", "Transaction Count"];
        summary = {
          title: "Business Performance Report",
          "Total Commission": totalCommissionEarnedFormatted,
          "Number of Businesses": dataToExport.length,
          "Date Range": dateRange?.[0] && dateRange?.[1]
            ? `${dayjs(dateRange[0]).format("MMM D, YYYY")} - ${dayjs(dateRange[1]).format("MMM D, YYYY")}`
            : "All Dates"
        };
        fileName = `Biztrack_Business_Performance_${dayjs().format("YYYY-MM-DD_HHmmss")}`;
        break;
      }

      default:
        break;
    }
    return { dataToExport, headers, summary, fileName };
  }, [selectedTab, filteredTransactions, dateRange]);

  const handleCSVExport = () => {
    const { dataToExport, headers, fileName } = getExportData();

    if (!dataToExport || dataToExport.length === 0) {
      alert("No data to export for the current view.");
      return;
    }

    const csv = Papa.unparse(dataToExport, {
      header: true,
      columns: headers,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePDFExport = () => {
    const { dataToExport, headers, summary, fileName } = getExportData();

    if (!dataToExport || dataToExport.length === 0) {
      alert("No data to export for the current view.");
      return;
    }

    const doc = new jsPDF();
    let yPos = 14;

    // Title
    doc.setFontSize(18);
    doc.text(summary.title, 14, yPos);
    yPos += 10;

    // Export Timestamp
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Export Date: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`, 14, yPos);
    yPos += 10;
    doc.setTextColor(0);

    // Summary Info
    doc.setFontSize(10);
    Object.entries(summary).forEach(([key, value]) => {
      if (key !== "title") {
        doc.text(`${key}: ${value}`, 14, yPos);
        yPos += 7;
      }
    });
    yPos += 5;

    // Prepare table body
    const tableHeaders = [headers];
    const tableBody = dataToExport.map((row) =>
      headers.map((header) => {
        if (
          typeof row[header] === "number" &&
          (header.includes("Commission") || header.includes("Total Commission"))
        ) {
          return formatKSh(row[header]);
        }
        return row[header];
      })
    );

    doc.autoTable({
      startY: yPos,
      head: tableHeaders,
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [55, 65, 81],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
      },
      columnStyles: {
        ...headers.reduce((acc, header, index) => {
          if (
            header.includes("Commission") ||
            header.includes("Total Commission")
          ) {
            acc[index] = { halign: "right" };
          }
          return acc;
        }, {}),
      },
    });

    doc.save(`${fileName}.pdf`);
  };

  return (
    <div className="bg-white p-4 mb-4 ml-2">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {/* Left Side: Search and Filters */}
        <div className="flex gap-4 flex-wrap items-center flex-1">
          {/* Search Input */}
          <div className="min-w-64">
            <SearchInput
              id="reports-search"
              placeholder="Search transactions or businesses..."
              input={searchTerm}
              handleInput={handleSearchInput}
              handleClear={handleSearchClear}
              error={false}
              disabled={false}
              primaryColor={themeColor}
            />
          </div>

          {/* Date Range Filter */}
          <DateRangeInput
            type="reports"
            color={themeColor}
            selected={filters.startDate && filters.endDate ? {
              startDate: filters.startDate,
              endDate: filters.endDate
            } : null}
            dateFilter={dateFilter}
            anchorEl={dateFilterAnchorEl}
            selectedAction={handleDateSelected}
            handleDateFilter={handleDateFilter}
            handleClose={handleDateFilterClose}
            handleClick={handleDateFilterClick}
          />

          {/* Advanced Filter Button */}
          <FilterInput
            color={themeColor}
            label="advanced-filter"
            filters={statusFilters}
            filters2={paymentMethodFilters}
            options={filterOptions}
            selected={selectedItems}
            selectedAction={setSelectedItems}
            tableFilter={tableFilter}
            handleTableFilter={handleTableFilter}
            anchorEl={filterAnchorEl}
            handleClose={handleFilterClose}
            handleClick={handleFilterClick}
          />
        </div>

        {/* Right Side: Export Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <Table size={18} />
                Export CSV
              </div>
            }
            color={themeColor}
            isLoading={false}
            validation={true}
            action={handleCSVExport}
            variant="outlined"
          />

          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <FileText size={18} />
                Export PDF
              </div>
            }
            color={themeColor}
            isLoading={false}
            validation={true}
            action={handlePDFExport}
            variant="contained"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsControls;