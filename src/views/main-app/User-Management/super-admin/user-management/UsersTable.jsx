// UsersTable.jsx
import React from 'react';
import { Users } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import DataTable from '../../../../../components/datatable';

const USERS_TABLE_HEADERS = [
  { title: '', key: 'all' },
  { title: 'User', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Business', key: 'businessName' },
  { title: 'Phone Number', key: 'phoneNumber' },
  { title: 'Role', key: 'role' },
  { title: 'Date Joined', key: 'dateJoined' },
  { title: 'Status', key: 'status' },
  { title: 'Action', key: 'action' },
];

// Default getInitials function
const defaultGetInitials = (firstName = '', lastName = '') => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

// Default formatDate function
const defaultFormatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

const UsersTable = ({
  filteredUsers = [],
  selectedItems = [],
  setSelectedItems,
  toggleSelectAll,
  toggleSelectItem,
  openModalForEdit,
  openEnableView,
  openEnableModal,
  openDisableModal,
  openDeleteModal,
  getInitials = defaultGetInitials,
  formatDate = defaultFormatDate,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  submitting = false
}) => {
  const theme = useTheme();

  // Handle the case where filteredUsers is undefined or null
  if (!filteredUsers) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
        <Users size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading users...</h3>
        <p className="text-gray-500">Please wait while we fetch the data</p>
      </div>
    );
  }

  // Then handle the empty array case
  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
        <Users size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No users found</h3>
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
    const user = filteredUsers.find(s => s.id === id);
    if (!user) {
      console.error('User not found with id:', id);
      return;
    }

    console.log('Action selected:', action, 'for user:', user.name);

    switch (action.toLowerCase()) {
      case 'view':
        console.log('Opening view modal for user:', user);
        openEnableView(user);
        break;
      case 'edit':
        console.log('Opening edit modal for user:', user);
        openModalForEdit(user);
        break;
      case 'enable':
        console.log('Opening enable action modal for user:', user);
        openEnableModal(user);
        break;
      case 'disable':
        console.log('Opening disable action modal for user:', user);
        openDisableModal(user);
        break;
      case 'delete':
        console.log('Opening delete action modal for user:', user);
        openDeleteModal(user);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const handleRowClick = (column) => {
    console.log('Row clicked:', column);
  };

  // Transform user data for the DataTable
  const transformedUsers = filteredUsers.map(user => ({
    ...user,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email || 'N/A',
    businessName: user.businessName || user.business?.name || 'N/A',
    phoneNumber: user.phoneNumber || user.phone || 'N/A',
    initials: getInitials(user.firstName, user.lastName),
    dateJoined: formatDate(user.dateJoined || user.createdAt || user.lastLogin),
    status: user.status || 'N/A',
  }));

  // Calculate if all items are selected
  const isAllSelected = selectedItems.length === filteredUsers.length && 
                       filteredUsers.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <DataTable
        data={transformedUsers}
        headers={USERS_TABLE_HEADERS}
        type="user-table"
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

export default UsersTable;