// kiosk-admin/ReportControls.jsx
import React, { useState } from "react";
import { FileText, Download, Printer, ChevronRight } from "lucide-react";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import FilterInput from "../../../../../components/Input/FilterInput";
import AppFormButton from "../../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const ReportControls = ({
  activeTab,
  setActiveTab,
  tabs,
  loading,
  handleExport,
  handlePrint,
  selectedDateRange,
  onDateRangeChange,
  filterOptions,
  selectedFilters,
  onFilterChange,
}) => {
  // State for popover anchors
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const theme = useTheme();
  
  // Safely extract primary color with default
  const primaryColor = theme?.primaryColor || "#3B82F6";

  // Date range handlers
  const handleDateClick = (event) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateFilterChange = (hasFilter) => {
    console.log("Date filter changed:", hasFilter);
  };

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTableFilterChange = (hasFilter) => {
    console.log("Table filter changed:", hasFilter);
  };

  // Format date for display
  const formatDateRangeDisplay = () => {
    if (!selectedDateRange) return "Select Date Range";

    const { startDate, endDate } = selectedDateRange;
    const formatDate = (dateStr) => {
      const [day, month, year] = dateStr.split('-');
      return `${month}/${day}/${year}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
      <div className="p-4 md:p-6">
        {/* DESKTOP LAYOUT: Filters on left, buttons on right */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          {/* Left side: Filters together with small gap */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3">
              <DateRangeInput
                type="report"
                color={primaryColor}
                selected={selectedDateRange}
                dateFilter={!!selectedDateRange}
                anchorEl={dateAnchorEl}
                selectedAction={onDateRangeChange}
                handleDateFilter={handleDateFilterChange}
                handleClose={handleDateClose}
                handleClick={handleDateClick}
              />

              {filterOptions && (
                <FilterInput
                  color={primaryColor}
                  label="Report Filters"
                  filters={filterOptions}
                  selected={selectedFilters}
                  selectedAction={onFilterChange}
                  tableFilter={!!selectedFilters && selectedFilters.length > 0}
                  handleTableFilter={handleTableFilterChange}
                  anchorEl={filterAnchorEl}
                  handleClose={handleFilterClose}
                  handleClick={handleFilterClick}
                  options={["Filters"]}
                />
              )}
            </div>

            {/* Filter status indicators */}
            <div className="flex items-center gap-3 ml-2">
              {selectedDateRange && (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {formatDateRangeDisplay()}
                </span>
              )}
              {selectedFilters && selectedFilters.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedFilters.length} filter(s)
                </span>
              )}
            </div>
          </div>

          {/* Right side: Action buttons */}
          <div className="flex items-center gap-3">
            <div className="w-40">
              <AppFormButton
                text="PDF Report"
                color={primaryColor}
                isLoading={loading}
                validation={true}
                action={() => handleExport("pdf")}
                icon={<FileText size={18} />}
              />
            </div>

            <div className="w-40">
              <AppFormButton
                text="Export Data"
                color="invert"
                isLoading={loading}
                validation={true}
                action={() => handleExport("json")}
                icon={<Download size={18} />}
              />
            </div>

            <div className="w-32">
              <AppFormButton
                text="Print"
                color="invert"
                isLoading={false}
                validation={true}
                action={handlePrint}
                icon={<Printer size={18} />}
              />
            </div>
          </div>
        </div>

        {/* MOBILE/TABLET LAYOUT */}
        <div className="lg:hidden">
          {/* First Row: DateRange (left) and FilterInput (right) - NO GAP */}
          <div className="flex items-center mb-4 gap-0">
            {/* Date Range Input - Left side */}
            <div className="flex-1">
              <DateRangeInput
                type="report"
                color={primaryColor}
                selected={selectedDateRange}
                dateFilter={!!selectedDateRange}
                anchorEl={dateAnchorEl}
                selectedAction={onDateRangeChange}
                handleDateFilter={handleDateFilterChange}
                handleClose={handleDateClose}
                handleClick={handleDateClick}
              />
            </div>

            {/* Filter Input - Right side */}
            {filterOptions && (
              <div className="flex-1">
                <FilterInput
                  color={primaryColor}
                  label="Report Filters"
                  filters={filterOptions}
                  selected={selectedFilters}
                  selectedAction={onFilterChange}
                  tableFilter={!!selectedFilters && selectedFilters.length > 0}
                  handleTableFilter={handleTableFilterChange}
                  anchorEl={filterAnchorEl}
                  handleClose={handleFilterClose}
                  handleClick={handleFilterClick}
                  options={["Filters"]}
                />
              </div>
            )}
          </div>

          {/* Filter indicators for mobile */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDateRange && (
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${primaryColor}10`, // Adds opacity (hex + 10 for 6% opacity)
                  color: primaryColor,
                }}
              >
                Date: {formatDateRangeDisplay()}
              </span>
            )}
            {selectedFilters && selectedFilters.length > 0 && (
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              >
                {selectedFilters.length} Filter{selectedFilters.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Second Row: 3 buttons in one line (33% each) */}
          <div className="flex gap-3">
            {/* PDF Button - 33% width */}
            <div className="flex-1 min-w-0">
              <AppFormButton
                text="PDF Report"
                color={primaryColor}
                isLoading={loading}
                validation={true}
                action={() => handleExport("pdf")}
                icon={<FileText size={16} />}
              />
            </div>

            {/* Export Button - 33% width */}
            <div className="flex-1 min-w-0">
              <AppFormButton
                text="Export Data"
                color="invert"
                isLoading={loading}
                validation={true}
                action={() => handleExport("json")}
                icon={<Download size={16} />}
              />
            </div>

            {/* Print Button - 33% width */}
            <div className="flex-1 min-w-0">
              <AppFormButton
                text="Print"
                color="invert"
                isLoading={false}
                validation={true}
                action={handlePrint}
                icon={<Printer size={16} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs with Primary Color */}
      <div className="border-t border-gray-200">
        <div className="flex overflow-x-auto px-4 md:px-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                borderBottomColor: activeTab === tab.id ? primaryColor : 'transparent',
                color: activeTab === tab.id ? primaryColor : '#6B7280',
              }}
              className="flex items-center gap-1 md:gap-2 py-3 md:py-4 px-1 mr-4 md:mr-8 border-b-2 font-medium text-xs md:text-sm transition-all duration-300 whitespace-nowrap min-w-fit hover:text-gray-700"
              aria-label={`View ${tab.label} report`}
            >
              <span 
                style={{
                  color: activeTab === tab.id ? primaryColor : '#9CA3AF',
                }}
                className="transition-colors"
              >
                {React.cloneElement(tab.icon, { size: 16 })}
              </span>
              <span className="truncate max-w-[80px] sm:max-w-none">{tab.label}</span>
              {activeTab === tab.id && (
                <ChevronRight 
                  className="ml-1 hidden sm:block" 
                  size={16} 
                  style={{ color: primaryColor }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportControls;