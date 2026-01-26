// src/components/users/UsersControls.jsx
import React, { useState } from 'react';
import SearchInput from '../../../../../components/input/SearchInput';
import DateRangeInput from '../../../../../components/input/DateRangeInput';
import FilterInput from '../../../../../components/input/FilterInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';

const UsersControls = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  selectedItems,
  setSelectedItems,
  openModal
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(false);

  // Get primary color from theme context
  const { primaryColor } = useTheme();
  
  // Default color if theme context doesn't provide one
  const themeColor = primaryColor || '#2563eb';

  console.log("🎨 UsersControls - Theme primary color:", themeColor);

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
  const filterOptions = ['Status', 'Role', 'Business'];

  const statusFilters = [
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'INACTIVE', value: 'INACTIVE' }
  ];

  const roleFilters = [
    { label: 'Hotel Admin', value: 'Hotel Admin' },
    { label: 'Hotel Cashier', value: 'Hotel Cashier' },
    { label: 'Hotel Waiter', value: 'Hotel Waiter' },
    { label: 'Kiosk Admin', value: 'Kiosk Admin' },
    { label: 'Kiosk Shopkeeper', value: 'Kiosk Shopkeeper' },
    { label: 'Hospital Admin', value: 'Hospital Admin' },
    { label: 'Doctor', value: 'Doctor' },
    { label: 'Nurse', value: 'Nurse' },
    { label: 'Lab Technician', value: 'Lab Technician' },
    { label: 'Receptionist', value: 'Receptionist' },
    { label: 'Pharmacist', value: 'Pharmacist' },
    { label: 'Retail Admin', value: 'Retail Admin' },
    { label: 'Cashier', value: 'Cashier' },
    { label: 'Sales Associate', value: 'Sales Associate' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Staff', value: 'Staff' }
  ];

  const businessFilters = [
    { label: 'Grand Hotel Plaza', value: 'Grand Hotel Plaza' },
    { label: 'City Medical Center', value: 'City Medical Center' },
    { label: 'SuperMart Retail', value: 'SuperMart Retail' },
    { label: 'Downtown Kiosk', value: 'Downtown Kiosk' }
  ];

  return (
    <div className="bg-white p-4 mb-4 ml-2">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {/* Left Side: Search and Filters */}
        <div className="flex gap-4 flex-wrap items-center flex-1">
          {/* Search Input */}
          <div className="min-w-64">
            <SearchInput
              id="users-search"
              placeholder="Search by name, email, username, or business..."
              input={searchTerm}
              handleInput={handleSearchInput}
              handleClear={handleSearchClear}
              error={false}
              disabled={false}
              primaryColor={themeColor} // Pass primary color to SearchInput
            />
          </div>

          {/* Date Range Filter */}
          <DateRangeInput
            type="users"
            color={themeColor} // Use theme color
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
            color={themeColor} // Use theme color
            label="advanced-filter"
            filters={statusFilters}
            filters2={roleFilters}
            filters3={businessFilters}
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

        {/* Right Side: Create User Button */}
        <div className="flex-shrink-0">
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <Plus size={18} />
                Add User
              </div>
            }
            color={themeColor} // Use theme color
            isLoading={false}
            validation={true}
            action={openModal}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersControls;