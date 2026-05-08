// StaffTable.jsx
import React from 'react';
import { Users } from 'lucide-react';
import { useTheme } from '../../../../components/theme/ThemeContext';
import DataTable from '../../../../components/datatable';

const STAFF_TABLE_HEADERS = [
  { title: '', key: 'all' },
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Role', key: 'role' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Date Joined', key: 'dateJoined' },
  { title: 'Last Login', key: 'lastLogin' }, 
  { title: 'Status', key: 'status' },
  { title: 'Action', key: 'action' },
];

const StaffTable = (props) => {
  // Safely destructure with defaults
  const {
    filteredStaff = [],
    selectedItems = [],
    setSelectedItems,
    toggleSelectAll,
    toggleSelectItem,
    openModalForEdit,
    openEnableView,
    openEnableModal,
    openDisableModal,
    openDeleteModal,
    getInitials,
    formatDate,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    submitting = false
  } = props || {};

  const theme = useTheme();

  // Ensure arrays are always arrays
  const safeFilteredStaff = Array.isArray(filteredStaff) ? filteredStaff : [];
  const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : [];

  // No Results State
  if (safeFilteredStaff.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
        <Users size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No staff members found</h3>
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
    const staff = safeFilteredStaff.find(s => s?.id === id);
    if (!staff) {
      console.error('Staff member not found with id:', id);
      return;
    }

    console.log('Action selected:', action, 'for staff:', staff.firstName, staff.lastName);

    switch (action.toLowerCase()) {
      case 'view':
        console.log('Opening view modal for staff:', staff);
        openEnableView?.(staff);
        break;
      case 'edit':
        console.log('Opening edit modal for staff:', staff);
        openModalForEdit?.(staff);
        break;
      case 'enable':
        console.log('Opening enable action modal for staff:', staff);
        openEnableModal?.(staff);
        break;
      case 'disable':
        console.log('Opening disable action modal for staff:', staff);
        openDisableModal?.(staff);
        break;
      case 'delete':
        console.log('Opening delete action modal for staff:', staff);
        openDeleteModal?.(staff);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const handleRowClick = (column) => {
    console.log('Row clicked:', column);
  };

  // Format last login time with relative time or exact date
  const formatLastLogin = (lastLoginDate) => {
    if (!lastLoginDate) {
      return 'Never logged in';
    }

    const date = new Date(lastLoginDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      // For older dates, show formatted date
      return formatDate?.(lastLoginDate) || date.toLocaleDateString();
    }
  };

  // Transform staff data for the DataTable - UPDATED with lastLogin
  const transformedStaff = safeFilteredStaff.map(staff => ({
    ...staff,
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || '',
    dateJoined: formatDate?.(staff?.createdAt) || staff?.createdAt || '',
    lastLogin: staff?.lastLogin 
      ? formatLastLogin(staff.lastLogin)
      : 'Never logged in',
    status: staff?.status || 'INACTIVE',
    // Keep the original lastLogin date for sorting if needed
    lastLoginDate: staff?.lastLogin || null,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <DataTable
        data={transformedStaff}
        headers={STAFF_TABLE_HEADERS}
        type="user-table"
        selected={safeSelectedItems}
        selectedAction={setSelectedItems}
        selectAll={toggleSelectAll}
        all={safeSelectedItems.length === safeFilteredStaff.length && safeFilteredStaff.length > 0}
        actionSelected={handleActionSelected}
        selectedRow={handleRowClick}
        actions={getActionsForStatus}
        clickable={true}
        color={theme?.primaryColor}
      />
    </div>
  );
};

export default StaffTable;