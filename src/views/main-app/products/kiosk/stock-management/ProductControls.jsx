import React, { useState } from 'react';
import SearchInput from '../../../../../components/input/SearchInput';
import DateRangeInput from '../../../../../components/input/DateRangeInput';
import FilterInput from '../../../../../components/input/FilterInput';
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
    // You can implement date filtering for products if needed
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
    <div className="bg-white p-4 mb-4 ml-2">
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

          {/* Date Range Filter - Optional for products */}
          <DateRangeInput
            type="products"
            color={primaryColor}
            selected={null} // You can implement date filtering if needed
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