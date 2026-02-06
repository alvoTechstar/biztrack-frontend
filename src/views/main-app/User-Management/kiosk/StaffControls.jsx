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
    <div className="bg-white p-4 mb-4 ml-2 sm:p-1 m-0">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Left Side: Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
          {/* Search Input - Full width on mobile, normal on desktop */}
          <div className="w-full sm:w-auto sm:flex-1 mb-2 sm:mb-0">
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

          {/* Date Range and Filter - Right next to search on all sizes */}
          <div className="flex gap-0 sm:gap-4 w-full sm:w-auto">
            {/* Date Range Filter */}
            <div className="flex-1 sm:flex-none">
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
            </div>

            {/* Advanced Filter Button - No gap on mobile */}
            <div className="flex-1 sm:flex-none ml-0 sm:ml-0">
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
          </div>
        </div>

        {/* Right Side: Add Staff Button - Full width on mobile, normal on desktop */}
        <div className="w-full lg:w-auto mt-4 lg:mt-0">
          <AppFormButton
            text={
              <div className="flex items-center justify-center lg:justify-start gap-2">
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