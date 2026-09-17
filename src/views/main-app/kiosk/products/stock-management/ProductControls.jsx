import React, { useState } from 'react';
import SearchInput from '../../../../../components/Input/SearchInput';
import DateRangeInput from '../../../../../components/Input/DateRangeInput';
import FilterInput from '../../../../../components/Input/FilterInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import { PlusCircle } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';

const ProductControls = ({
  searchTerm,
  setSearchTerm,
  categories,
  onAddProduct,
  selectedItems,
  setSelectedItems,
  dateRange,
  setDateRange,
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

  const handleDateSelected = (range) => {
    setDateRange({
      startDate: range?.startDate || null,
      endDate: range?.endDate || null,
    });
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
  const filterOptions = ['Status', 'Category'];

  const statusFilters = [
    { label: 'In Stock', value: 'In Stock' },
    { label: 'Low Stock', value: 'Low Stock' },
    { label: 'Out of Stock', value: 'Out of Stock' }
  ];

  const categoryFilters = categories.map(category => ({
    label: category,
    value: category
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 sm:mb-8">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {/* Left Side: Search and Filters */}
        <div className="flex gap-4 flex-wrap items-center flex-1">
          {/* Search Input */}
          <div className="min-w-64">
            <SearchInput
              id="product-search"
              placeholder="Search by name or SKU..."
              input={searchTerm}
              handleInput={handleSearchInput}
              handleClear={handleSearchClear}
              error={false}
              disabled={false}
            />
          </div>

          {/* Date Range Filter */}
          <DateRangeInput
            type="products"
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

          {/* Advanced Filter Button */}
          <FilterInput
            color={primaryColor}
            label="advanced-filter"
            filters={statusFilters}
            filters2={categoryFilters}
            options={filterOptions}
            selected={selectedItems || []}
            selectedAction={setSelectedItems}
            selected2={selectedItems || []}
            selectedAction2={setSelectedItems}
            tableFilter={tableFilter}
            handleTableFilter={handleTableFilter}
            anchorEl={filterAnchorEl}
            handleClose={handleFilterClose}
            handleClick={handleFilterClick}
          />
        </div>

        {/* Right Side: Add Product Button */}
        <div className="flex-shrink-0">
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <PlusCircle size={18} />
                Add Product
              </div>
            }
            color={primaryColor}
            isLoading={false}
            validation={true}
            action={onAddProduct}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductControls;