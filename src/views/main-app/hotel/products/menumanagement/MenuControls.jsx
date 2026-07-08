import React, { useState } from 'react';
import SearchInput from '../../../../../components/Input/SearchInput';
import FilterInput from '../../../../../components/Input/FilterInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import { PlusCircle } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';

const MenuControls = ({
  searchTerm,
  setSearchTerm,
  categories,
  onAddItem,
  selectedItems,
  setSelectedItems,
}) => {
  const { primaryColor } = useTheme();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);

  const statusFilters = [
    { label: 'Available', value: 'Available' },
    { label: 'Unavailable', value: 'Unavailable' },
  ];

  const categoryFilters = categories.map((category) => ({
    label: category,
    value: category,
  }));

  return (
    <div className="bg-white p-4 mb-4 ml-2">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {/* Left Side: Search and Filters */}
        <div className="flex gap-4 flex-wrap items-center flex-1">
          <div className="min-w-64">
            <SearchInput
              id="menu-search"
              placeholder="Search by name or description..."
              input={searchTerm}
              handleInput={setSearchTerm}
              handleClear={() => setSearchTerm('')}
              error={false}
              disabled={false}
            />
          </div>

          <FilterInput
            color={primaryColor}
            label="advanced-filter"
            filters={statusFilters}
            filters2={categoryFilters}
            options={['Availability', 'Category']}
            selected={selectedItems || []}
            selectedAction={setSelectedItems}
            tableFilter={tableFilter}
            handleTableFilter={setTableFilter}
            anchorEl={filterAnchorEl}
            handleClose={() => setFilterAnchorEl(null)}
            handleClick={(event) => setFilterAnchorEl(event.currentTarget)}
          />
        </div>

        {/* Right Side: Add Item Button */}
        <div className="flex-shrink-0">
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <PlusCircle size={18} />
                Add Menu Item
              </div>
            }
            color={primaryColor}
            isLoading={false}
            validation={true}
            action={onAddItem}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuControls;
