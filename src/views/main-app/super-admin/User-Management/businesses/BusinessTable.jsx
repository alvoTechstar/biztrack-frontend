import React from 'react';
import { Building2 } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import DataTable from '../../../../../components/datatable';

const BUSINESS_TABLE_HEADERS = [
  { title: '', key: 'all' },
  { title: 'Created At', key: 'createdAt' },
  { title: 'Business ID', key: 'businessId' },
  { title: 'Registration Number', key: 'registrationNumber' },
  { title: 'Business Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'Phone Number', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
  { title: 'Action', key: 'action' },
];

const BusinessTable = ({
  filteredBusinesses,
  selectedItems = [],
  setSelectedItems,
  toggleSelectAll,
  toggleSelectItem,
  openModalForEdit,
  openEnableView,
  openEnableModal,
  openDisableModal,
  openDeleteModal,
}) => {
  const theme = useTheme();
  if (!filteredBusinesses) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
        <Building2 size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading businesses...</h3>
        <p className="text-gray-500">Please wait while we fetch the data</p>
      </div>
    );
  }

  if (filteredBusinesses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
        <Building2 size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No businesses found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  const getActionsForStatus = (status) => {
    const upperStatus = status?.toUpperCase();

    if (upperStatus === 'ACTIVE') {
      return ['View', 'Edit', 'Disable', 'Delete'];
    } else if (upperStatus === 'INACTIVE') {
      return ['View', 'Edit', 'Enable', 'Delete'];
    } else if (upperStatus === 'PENDING' || upperStatus === 'NEW') {
      return ['View', 'Edit', 'Enable', 'Delete'];
    }
    return ['View', 'Edit', 'Delete'];
  };

  const handleActionSelected = (action, id) => {
    const business = filteredBusinesses.find(b => b.id === id);
    if (!business) {
      console.error('Business not found with id:', id);
      return;
    }
    switch (action.toLowerCase()) {
      case 'view':
        openEnableView(business);
        break;
      case 'edit':
        openModalForEdit(business);
        break;
      case 'enable':
        openEnableModal(business);
        break;
      case 'disable':
        openDisableModal(business);
        break;
      case 'delete':
        openDeleteModal(business);
        break;
      default:
    }
  };

  const handleRowClick = (column) => {
  };
  const isAllSelected = selectedItems.length === filteredBusinesses.length &&
    filteredBusinesses.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <DataTable
        data={filteredBusinesses}
        headers={BUSINESS_TABLE_HEADERS}
        type="business-table"
        selected={selectedItems}
        selectedAction={setSelectedItems}
        selectAll={toggleSelectAll}
        all={isAllSelected}
        actionSelected={handleActionSelected}
        selectedRow={handleRowClick}
        actions={getActionsForStatus}
        clickable={true}
        color={theme.primaryColor}
      />
    </div>
  );
};

export default BusinessTable;