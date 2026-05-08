// src/views/main-app/reports/super-admin/components/BusinessCommissionTable.jsx
import React from 'react';
import { Building, TrendingUp } from 'lucide-react';
import DataTable from '../../../../components/datatable';
import { Chip, Typography } from '@mui/material';
import { useTheme } from '../../../../components/theme/ThemeContext';

const formatKSh = (amount) => {
  return `KSh ${parseFloat(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Define table headers
const BUSINESS_COMMISSION_HEADERS = [
  { title: 'Rank', key: 'rank' },
  { title: 'Business Name', key: 'name' },
  { title: 'Market Share', key: 'percentage' },
  { title: 'Commission', key: 'commission' },
];

// Colors for ranking badges and chips
const BAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#6B7280', // Gray
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

const BusinessCommissionTable = ({
  businessData = [],
  selectedItems = [],
  setSelectedItems,
  toggleSelectAll,
  toggleSelectItem,
  selectedRow,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  submitting = false
}) => {
  const theme = useTheme();

  // Handle empty data
  if (!businessData || businessData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <Building size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No business data found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  // Transform data for the DataTable
  const transformedData = businessData.map((business, index) => ({
    ...business,
    rank: index + 1,
    id: business.id || `${business.name}-${index}`,
    formattedCommission: formatKSh(business.commission),
    formattedPercentage: `${business.percentage.toFixed(1)}%`,
  }));

  // Handle row click
  const handleRowClick = (column) => {
    console.log('Row clicked:', column);
    if (selectedRow) {
      selectedRow(column);
    }
  };

  // Handle action selected (if needed)
  const handleActionSelected = (action, id) => {
    console.log('Action selected:', action, 'for business:', id);
    // Add any business-specific actions here
  };

  // Calculate if all items are selected
  const isAllSelected = selectedItems.length === businessData.length &&
    businessData.length > 0;

  // Get actions based on business status (customize as needed)
  const getActionsForBusiness = (business) => {
    // Add business-specific actions here if needed
    return ['View', 'Export'];
  };

  // Define custom renderers for each column
  const customRenderers = {
    rank: (value, row) => (
      <div className="flex items-center justify-center w-full">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${value === 1 ? 'bg-amber-100' :
            value === 2 ? 'bg-gray-100' :
              value === 3 ? 'bg-orange-100' : 'bg-blue-50'
          }`}>
          <Typography
            variant="body2"
            className={`font-bold ${value === 1 ? 'text-amber-700' :
                value === 2 ? 'text-gray-700' :
                  value === 3 ? 'text-orange-700' : 'text-blue-700'
              }`}
          >
            #{value}
          </Typography>
        </div>
      </div>
    ),
    name: (value, row) => (
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
          <Building size={18} className="text-blue-600" />
        </div>
        <div className="min-w-0">
          <Typography variant="body1" className="font-medium text-gray-900 truncate">
            {value}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {row.percentage.toFixed(1)}% of total
          </Typography>
        </div>
      </div>
    ),
    percentage: (value, row) => (
      <div className="flex items-center justify-center">
        <Chip
          label={`${value.toFixed(1)}%`}
          size="small"
          className="font-medium"
          style={{
            backgroundColor: BAR_COLORS[(row.rank - 1) % BAR_COLORS.length] + '20',
            color: BAR_COLORS[(row.rank - 1) % BAR_COLORS.length],
            minWidth: '70px'
          }}
        />
      </div>
    ),
    commission: (value, row) => (
      <div className="text-right">
        <Typography variant="body1" className="font-bold text-green-700">
          {formatKSh(value)}
        </Typography>
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden mt-1 ml-auto">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(row.percentage, 100)}%`,
              backgroundColor: BAR_COLORS[(row.rank - 1) % BAR_COLORS.length]
            }}
          />
        </div>
      </div>
    ),
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <DataTable
        data={transformedData}
        headers={BUSINESS_COMMISSION_HEADERS}
        type="business-commission-table"
        selected={selectedItems}
        selectedAction={setSelectedItems}
        selectAll={toggleSelectAll}
        all={isAllSelected}
        actionSelected={handleActionSelected}
        selectedRow={handleRowClick}
        actions={getActionsForBusiness}
        clickable={true}
        customRenderers={customRenderers}
        color={theme.primaryColor}
      />
    </div>
  );
};

export default BusinessCommissionTable;