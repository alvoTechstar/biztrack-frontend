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
  openModal,
  filterRoles = [],
}) => {
  const theme = useTheme();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(false);

  // Separate state for status/role filter selections — not row selection
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // ── Search ──────────────────────────────────────────────────
  const handleSearchInput = (value) => setSearchTerm(value);
  const handleSearchClear = ()      => setSearchTerm('');

  // ── Date filter ─────────────────────────────────────────────
  const handleDateFilterClick = (e) => setDateFilterAnchorEl(e.currentTarget);
  const handleDateFilterClose = ()  => setDateFilterAnchorEl(null);
  const handleDateFilter      = (v) => setDateFilter(v);

  const handleDateSelected = (dateRange) => {
    setFilters(prev => ({
      ...prev,
      startDate: dateRange?.startDate || null,
      endDate:   dateRange?.endDate   || null,
    }));
  };

  // ── Advanced filter ─────────────────────────────────────────
  const handleFilterClick = (e) => setFilterAnchorEl(e.currentTarget);
  const handleFilterClose = ()  => setFilterAnchorEl(null);

  // Called by FilterInput: true = Apply clicked, false = checkbox interaction or Reset
  const handleTableFilter = (isFiltered) => {
    setTableFilter(isFiltered);
    if (isFiltered) {
      // Apply — push current selections into parent filters
      setFilters(prev => ({
        ...prev,
        status: selectedStatuses.length > 0 ? selectedStatuses[0] : '',
        role:   selectedRoles.length   > 0 ? selectedRoles[0]   : '',
      }));
    }
  };

  // Wrap selectedAction so clearing statuses also clears the parent filter
  const handleStatusAction = (newStatuses) => {
    setSelectedStatuses(newStatuses);
    if (newStatuses.length === 0) {
      setFilters(prev => ({ ...prev, status: '' }));
    }
  };

  // Wrap selectedAction2 so clearing roles also clears the parent filter
  const handleRoleAction = (newRoles) => {
    setSelectedRoles(newRoles);
    if (newRoles.length === 0) {
      setFilters(prev => ({ ...prev, role: '' }));
    }
  };

  // ── Filter options ───────────────────────────────────────────
  const filterOptions = ['Status', 'Role'];

  const statusFilters = [
    { label: 'ACTIVE',   value: 'ACTIVE'   },
    { label: 'INACTIVE', value: 'INACTIVE' },
  ];

  // Build role filters from the prop — falls back to empty if not provided
  const roleFilters = filterRoles.map(r => ({
    label: typeof r === 'string' ? r : r.label,
    value: typeof r === 'string' ? r : r.value,
  }));

  return (
    <div className="bg-white p-4 mb-4 ml-2 sm:p-1 m-0">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

        {/* Left: Search + Date + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">

          {/* Search */}
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

          <div className="flex gap-0 sm:gap-4 w-full sm:w-auto">
            {/* Date Range */}
            <div className="flex-1 sm:flex-none">
              <DateRangeInput
                type="staff"
                color={theme.primaryColor}
                selected={
                  filters.startDate && filters.endDate
                    ? { startDate: filters.startDate, endDate: filters.endDate }
                    : null
                }
                dateFilter={dateFilter}
                anchorEl={dateFilterAnchorEl}
                selectedAction={handleDateSelected}
                handleDateFilter={handleDateFilter}
                handleClose={handleDateFilterClose}
                handleClick={handleDateFilterClick}
              />
            </div>

            {/* Advanced Filter */}
            <div className="flex-1 sm:flex-none ml-0 sm:ml-0">
              <FilterInput
                color={theme.primaryColor}
                label="advanced-filter"
                filters={statusFilters}
                filters2={roleFilters}
                options={filterOptions}
                selected={selectedStatuses}
                selectedAction={handleStatusAction}
                selected2={selectedRoles}
                selectedAction2={handleRoleAction}
                tableFilter={tableFilter}
                handleTableFilter={handleTableFilter}
                anchorEl={filterAnchorEl}
                handleClose={handleFilterClose}
                handleClick={handleFilterClick}
              />
            </div>
          </div>
        </div>

        {/* Right: Add Staff */}
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
