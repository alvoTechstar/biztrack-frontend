import React, { useState } from 'react';
import SearchInput from '../../../components/Input/SearchInput';
import DateRangeInput from '../../../components/Input/DateRangeInput';
import FilterInput from '../../../components/input/FilterInput';
import { useTheme } from '../../../components/theme/ThemeContext';

const DebtControls = ({
  searchTerm,
  setSearchTerm,
  selectedItems,
  setSelectedItems,
}) => {
  const { primaryColor } = useTheme();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(false);

  // Handle search input
  const handleSearchInput = (value) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // Handle date filter
  const handleDateFilterClick = (event) => {
    setDateFilterAnchorEl(event.currentTarget);
  };

  const handleDateFilterClose = () => {
    setDateFilterAnchorEl(null);
  };

  const handleDateFilter = (isFiltered) => {
    setDateFilter(isFiltered);
  };

  const handleDateSelected = (dateRange) => {
    // You can implement date filtering for debts if needed
    console.log('Date range selected:', dateRange);
  };

  // Handle advanced filter
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTableFilter = (isFiltered) => {
    setTableFilter(isFiltered);
  };

  // Filter options for the FilterInput component
  const filterOptions = ['Status'];

  // Default debt status filters
  const statusFilters = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Paid', value: 'Completed' },
    { label: 'Overdue', value: 'Overdue' }
  ];

  return (
    <div className="bg-white p-4 mb-4 ml-2">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {/* Left Side: Search and Filters */}
        <div className="flex gap-4 flex-wrap items-center flex-1">
          {/* Search Input */}
          <div className="min-w-64">
            <SearchInput
              id="debt-search"
              placeholder="Search by customer name, transaction ID, or phone..."
              input={searchTerm}
              handleInput={handleSearchInput}
              handleClear={handleSearchClear}
              error={false}
              disabled={false}
            />
          </div>

          {/* Date Range Filter - Optional for debts */}
          <DateRangeInput
            type="debts"
            color={primaryColor}
            selected={null}
            dateFilter={dateFilter}
            anchorEl={dateFilterAnchorEl}
            selectedAction={handleDateSelected}
            handleDateFilter={handleDateFilter}
            handleClose={handleDateFilterClose}
            handleClick={handleDateFilterClick}
          />

          {/* Advanced Filter Button */}
          <FilterInput
            color={primaryColor}
            label="advanced-filter"
            filters={statusFilters}
            filters2={[]} // Empty array for second filter (no categories for debts)
            options={filterOptions}
            selected={selectedItems || []}
            selectedAction={setSelectedItems}
            tableFilter={tableFilter}
            handleTableFilter={handleTableFilter}
            anchorEl={filterAnchorEl}
            handleClose={handleFilterClose}
            handleClick={handleFilterClick}
          />
        </div>
      
      </div>
    </div>
  );
};

export default DebtControls;