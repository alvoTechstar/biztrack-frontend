// src/components/business/BusinessControls.jsx
import React, { useState } from 'react';
import SearchInput from '../../../../../components/Input/SearchInput';
import DateRangeInput from '../../../../../components/Input/DateRangeInput';
import FilterInput from "../../../../../components/Input/FilterInput"
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';

const BusinessControls = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  businessTypes,
  selectedItems,
  setSelectedItems,
  openModal
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(false);

  const { primaryColor } = useTheme();

  const themeColor = primaryColor;
  const handleSearchInput = (value) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };
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
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTableFilter = (isFiltered) => {
    setTableFilter(isFiltered);
  };

  const filterOptions = ['Status', 'Business Type'];

  const statusFilters = [
    // { label: 'NEW', value: 'NEW' },
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'INACTIVE', value: 'INACTIVE' }
  ];

  const typeFilters = businessTypes.map(type => ({
    label: type,
    value: type
  }));

  return (
    <div className="bg-white  p-4 mb-4 ml-2">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        <div className="flex gap-4 flex-wrap items-center flex-1 ">
          <div className="min-w-64">
            <SearchInput
              id="business-search"
              placeholder="Search by name, email, or registration number..."
              input={searchTerm}
              handleInput={handleSearchInput}
              handleClear={handleSearchClear}
              error={false}
              disabled={false}
              primaryColor={themeColor}
            />
          </div>

          <DateRangeInput
            type="business"
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

          <FilterInput
            color={themeColor}
            label="advanced-filter"
            filters={statusFilters}
            filters2={typeFilters}
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

        <div className="flex-shrink-0">
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <Plus size={18} />
                Add Business
              </div>
            }
            color={themeColor}
            isLoading={false}
            validation={true}
            action={openModal}
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessControls;