// StaffControls.jsx
import React, { useState } from 'react';
import SearchInput from '../../../../components/Input/SearchInput';
import DateRangeInput from '../../../../components/Input/DateRangeInput';
import FilterInput from '../../../../components/Input/FilterInput';
import AppFormButton from '../../../../components/buttons/AppFormButton';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../../components/theme/ThemeContext';

const StaffControls = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  selectedItems,
  setSelectedItems,
  openModal
}) => {
  const theme = useTheme();
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
    if (dateRange) {
      setFilters(prev => ({
        ...prev,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: null,
        endDate: null
      }));
    }
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
  const filterOptions = ['Status', 'Role'];

  const statusFilters = [
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'INACTIVE', value: 'INACTIVE' }
  ];

  const roleFilters = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Shopkeeper', value: 'Shopkeeper' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Staff', value: 'Staff' }
  ];

  return (
    <div className="bg-white p-4 mb-4 ml-2">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {/* Left Side: Search and Filters */}
        <div className="flex gap-4 flex-wrap items-center flex-1">
          {/* Search Input */}
          <div className="min-w-64">
            <SearchInput
              id="staff-search"
              placeholder="Search by name, email, or phone..."
              input={searchTerm}
              handleInput={handleSearchInput}
              handleClear={handleSearchClear}
              error={false}
              disabled={false}
            />
          </div>

          {/* Date Range Filter */}
          <DateRangeInput
            type="staff"
            color={theme.primaryColor}
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
            color={theme.primaryColor}
            label="advanced-filter"
            filters={statusFilters}
            filters2={roleFilters}
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

        {/* Right Side: Add Staff Button */}
        <div className="flex-shrink-0">
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <Plus size={18} />
                Add Staff
              </div>
            }
            color={theme.primaryColor}
            isLoading={false}
            validation={true}
            action={openModal}
          />
        </div>
      </div>
    </div>
  );
};

export default StaffControls;