import React, { useState } from 'react';
import SearchInput from '../../../../components/Input/SearchInput';
import DateRangeInput from '../../../../components/Input/DateRangeInput';
import FilterInput from '../../../../components/Input/FilterInput';
import { useTheme } from '../../../../components/theme/ThemeContext';

const DebtControls = ({
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
}) => {
  const { primaryColor } = useTheme();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(false);

  // Local checkbox selection — collapsed into the parent's single statusFilter on Apply
  const [selectedStatuses, setSelectedStatuses] = useState(
    statusFilter && statusFilter !== 'All' ? [statusFilter] : []
  );

  const handleSearchInput = (value) => setSearchFilter(value);
  const handleSearchClear = () => setSearchFilter('');

  const handleDateFilterClick = (event) => setDateFilterAnchorEl(event.currentTarget);
  const handleDateFilterClose = () => setDateFilterAnchorEl(null);
  const handleDateFilter = (isFiltered) => setDateFilter(isFiltered);

  const handleDateSelected = (range) => {
    setDateRange({
      startDate: range?.startDate || null,
      endDate: range?.endDate || null,
    });
  };

  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  // Called by FilterInput: true = Apply clicked, false = checkbox interaction or Reset
  const handleTableFilter = (isFiltered) => {
    setTableFilter(isFiltered);
    if (isFiltered) {
      setStatusFilter(selectedStatuses.length > 0 ? selectedStatuses[0] : 'All');
    }
  };

  const handleStatusAction = (newStatuses) => {
    setSelectedStatuses(newStatuses);
    if (newStatuses.length === 0) {
      setStatusFilter('All');
    }
  };

  const filterOptions = ['Status'];

  const statusFilters = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Paid', value: 'Completed' },
    { label: 'Overdue', value: 'Overdue' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-stretch sm:items-center">
        <div className="w-full sm:w-auto">
          <SearchInput
            id="debt-search"
            placeholder="Search by customer name, transaction ID, or phone..."
            input={searchFilter}
            handleInput={handleSearchInput}
            handleClear={handleSearchClear}
            error={false}
            disabled={false}
          />
        </div>

        <div className="flex flex-wrap items-center">
          <DateRangeInput
            type="debts"
            color={primaryColor}
            selected={
              dateRange?.startDate && dateRange?.endDate
                ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
                : null
            }
            dateFilter={dateFilter}
            anchorEl={dateFilterAnchorEl}
            selectedAction={handleDateSelected}
            handleDateFilter={handleDateFilter}
            handleClose={handleDateFilterClose}
            handleClick={handleDateFilterClick}
          />

          <FilterInput
            color={primaryColor}
            label="advanced-filter"
            filters={statusFilters}
            options={filterOptions}
            selected={selectedStatuses}
            selectedAction={handleStatusAction}
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
