// src/components/users/UsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus } from 'lucide-react';
import UsersTable from './UsersTable';
import CreateUserForm from './CreateUserForm';
import EnableUserView from './EnableUserView';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import ContentLoader from '../../../../../components/Loader/ContentLoader';
import UsersControls from './UserControls';
import { useActionModal } from '../../../../../hooks/useActionModal';
import ActionModal from '../../../../../components/modal/ActionModal';
import { GET, POST, PUT, DELETE } from "../../../../../services/DatabaseServiceImp";
import URLS from '../../../../../utilities/Endpoints';
import { formatDate, getInitials } from '../../../../../utilities/SharedFunctions';
import Toaster from '../../../../../components/Toaster';

const UsersPage = () => {
  const theme = useTheme();

  // Data states
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: null,
    role: null,
    business: null
  });

  const [currentView, setCurrentView] = useState('table');
  const [actionModalLoading, setActionModalLoading] = useState(false);
  const [actionLoadingText, setActionLoadingText] = useState('');
  const [formModalLoading, setFormModalLoading] = useState(false);
  const [formLoadingText, setFormLoadingText] = useState('');
  const [loadingState, setLoadingState] = useState(true);
  const [loadingText, setLoadingText] = useState("");
  const [loadedText, setLoadedText] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createLoadingText, setCreateLoadingText] = useState("");
  const [toaster, setToaster] = useState({
    open: false,
    state: 'true',
    title: '',
    message: '',
  });

  const { modalState, openModal, closeModal, setReason, handleSubmit } = useActionModal();

  const showToaster = (state, title, message) => {
    setToaster({
      open: true,
      state: state ? 'true' : 'false',
      title,
      message,
    });
  };

  // Role-based access control mapping
  const rolesByType = {
    'Hotel': ['Hotel Admin', 'Hotel Cashier', 'Hotel Waiter'],
    'Kiosk': ['Kiosk Admin', 'Kiosk Shopkeeper'],
    'Hospital': ['Hospital Admin', 'Doctor', 'Nurse', 'Lab Technician', 'Receptionist', 'Pharmacist'],
    'Retail': ['Retail Admin', 'Cashier', 'Sales Associate'],
    'System': ['System Admin', 'Support Staff'],
    'Other': ['Admin', 'Manager', 'Staff']
  };

  // Safe date handling function
  const safeDateToString = (dateValue) => {
    if (!dateValue) return 'Never';
    if (dateValue === 'Invalid Date' || dateValue === 'null' || dateValue === 'undefined') {
      return 'Never';
    }
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Never';
      }
      const year = date.getFullYear();
      if (year < 1970 || year > 2100) {
        return 'Never';
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Invalid date value:', dateValue, error);
      return 'Never';
    }
  };

  // Helper function to safely extract data from API response
  const extractDataFromResponse = (response) => {
    if (!response) return [];

    if (response.data !== undefined) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }

    if (Array.isArray(response)) {
      return response;
    }

    if (response._doc) {
      return [response._doc];
    }

    if (typeof response === 'object' && response !== null) {
      return [response];
    }

    return [];
  };

  // Helper function to extract business data from MongoDB/Mongoose structure
  const extractBusinessData = (business) => {
    if (!business) return null;

    if (business._doc) {
      return {
        id: business._doc.id || business._doc._id?.toString(),
        _id: business._doc._id?.toString(),
        businessId: business._doc.businessId,
        businessName: business._doc.businessName,
        businessType: business._doc.businessType,
        status: business._doc.status,
        owner: business._doc.owner,
        email: business._doc.email,
        phone: business._doc.phone,
        address: business._doc.address,
        registrationNumber: business._doc.registrationNumber,
        logoUrl: business._doc.logoUrl,
        primaryColor: business._doc.primaryColor,
        website: business._doc.website,
        description: business._doc.description,
      };
    }

    return {
      id: business.id || business._id?.toString(),
      _id: business._id?.toString(),
      businessId: business.businessId,
      businessName: business.businessName,
      businessType: business.businessType,
      status: business.status,
      owner: business.owner,
      email: business.email,
      phone: business.phone,
      address: business.address,
      registrationNumber: business.registrationNumber,
      logoUrl: business.logoUrl,
      primaryColor: business.primaryColor,
      website: business.website,
      description: business.description,
    };
  };

  const fetchUsersAndBusinesses = useCallback(async () => {
    setLoading(true);
    setLoadingState(true);
    setLoadingText("Fetching users and businesses...");
    setErrorMessage(null);

    try {
      const businessesResponse = await GET(URLS.BUSINESS.GET_ALL_BUSINESSES);
      let businessesData = extractDataFromResponse(businessesResponse);
      const transformedBusinesses = businessesData
        .map(business => extractBusinessData(business))
        .filter(business => business !== null && business.businessName);
      setBusinesses(businessesData);

      // Fetch users
      let usersData = [];

      try {
        const usersResponse = await GET(URLS.USERS.GET_ALL_USERS);
        usersData = extractDataFromResponse(usersResponse);
      } catch (usersError) {
        console.error('❌ Failed to fetch users:', usersError);
        const errorMsg = 'Unable to load users. Please check if the server is running.';
        setErrorMessage(errorMsg);

        // Show error toaster
        showToaster(false, 'Error', errorMsg);

        usersData = [];
      }
      const formattedUsers = usersData.map(user => {
        const userBusiness = transformedBusinesses.find(business => {
          const businessId = business.id || business._id;
          const userIdBusiness = user.businessId || user.associatedBusinessId || user.institutionId;
          return businessId === userIdBusiness ||
            businessId?.toString() === userIdBusiness?.toString();
        });

        return {
          id: user.id || user._id,
          firstName: user.firstName || user.firstname || '',
          lastName: user.lastName || user.lastname || '',
          email: user.email || '',
          institutionId: user.businessId || user.associatedBusinessId || user.institutionId || '',
          businessName: user.businessName || userBusiness?.businessName || user.institutionName || 'No Business',
          role: user.role || user.userRole || '',
          username: user.username || '',
          phoneNumber: user.phone || user.phoneNumber || '',
          status: (user.status || 'active').toUpperCase(),
          lastLogin: safeDateToString(user.lastLogin),
          businessType: userBusiness?.businessType || '',
          password: '',
          confirmPassword: ''
        };
      });
      setUsers(formattedUsers);
      setLoadingState(true);
      setLoadedText("Data loaded successfully");

      if (formattedUsers.length > 0) {
        showToaster(true, 'Success', `Loaded ${formattedUsers.length} user(s) and ${transformedBusinesses.length} business(es)`);
      } else {
        showToaster(true, 'Info', 'No users found. Start by adding your first user.');
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      const errorMsg = 'Failed to load data. Please check if the server is running.';
      setErrorMessage(errorMsg);
      setUsers([]);
      setBusinesses([]);

      setLoadingState(false);
      setLoadedText("Failed to load data");

      // Show error toaster
      showToaster(false, 'Error', errorMsg);

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndBusinesses();
  }, [fetchUsersAndBusinesses]);

  // Modal Handlers
  const openActionModalWithLoader = async (actionType, user) => {
    setActionModalLoading(true);

    switch (actionType) {
      case 'disable':
        setActionLoadingText('Preparing to disable user...');
        break;
      case 'enable':
        setActionLoadingText('Preparing to enable user...');
        break;
      case 'delete':
        setActionLoadingText('Preparing to delete user...');
        break;
      default:
        setActionLoadingText('Loading...');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const userName = `${user.firstName} ${user.lastName}`;

    switch (actionType) {
      case 'disable':
        openModal(
          'disable',
          user.id,
          userName,
          'user',
          (id, reason) => handleToggleStatus(id, 'inactive', reason),
          `You are about to disable "${userName}". By disabling, this user will no longer have access to the BizTrack application.`
        );
        break;
      case 'enable':
        openModal(
          'enable',
          user.id,
          userName,
          'user',
          (id, reason) => handleToggleStatus(id, 'active', reason),
          `You are about to enable "${userName}". This will restore their access to the BizTrack application.`
        );
        break;
      case 'delete':
        openModal(
          'delete',
          user.id,
          userName,
          'user',
          (id, reason) => handleDeleteUser(id, reason),
          `You are about to delete "${userName}". This will permanently remove the user account and all associated data.`
        );
        break;
      default:
    }

    setActionModalLoading(false);
  };

  const openFormModalWithLoader = async (modalType, user = null) => {
    setFormModalLoading(true);

    switch (modalType) {
      case 'create':
        setFormLoadingText('Loading create form...');
        break;
      case 'edit':
        setFormLoadingText('Loading edit form...');
        break;
      case 'enable':
        setFormLoadingText('Loading user details...');
        break;
      default:
        setFormLoadingText('Loading...');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    setEditingUser(user);
    setIsEditing(modalType === 'edit');
    setCurrentView(modalType);
    setFormModalLoading(false);
  };

  const closeAllModals = () => {
    setCurrentView('table');
    setEditingUser(null);
    setErrorMessage(null);
    closeModal();
  };

  const openCreateModal = () => openFormModalWithLoader('create');
  const openEditModal = (user) => openFormModalWithLoader('edit', user);
  const openEnableViewModal = (user) => openFormModalWithLoader('enable', user);
  const openEnableModal = (user) => openActionModalWithLoader('enable', user);
  const openDisableModal = (user) => openActionModalWithLoader('disable', user);
  const openDeleteModal = (user) => openActionModalWithLoader('delete', user);

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    setCreateLoading(true);
    setCreateLoadingText(isEditing ? "Updating user..." : "Creating user...");
    setErrorMessage(null);

    try {
      const userData = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        username: values.username.trim(),
        phoneNumber: values.phoneNumber.trim(),
        role: values.role,
        businessId: values.institutionId
      };

      if (!isEditing && values.password) {
        userData.password = values.password;
      }
      let response;
      if (isEditing && editingUser) {
        response = await PUT(URLS.USERS.UPDATE_USER.replace(':id', editingUser.id), userData);
      } else {
        response = await POST(URLS.USERS.CREATE_USER, userData);
      }

      const successMessage = isEditing
        ? `User "${values.firstName} ${values.lastName}" updated successfully!`
        : `User "${values.firstName} ${values.lastName}" created successfully!`;

      setCreateLoadingText(successMessage);

      showToaster(true, 'Success', successMessage);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await fetchUsersAndBusinesses();
      closeAllModals();

    } catch (error) {
      console.error('❌ Error submitting user form:', error);
      let serverError = 'A server error occurred. Please try again.';

      if (error.response?.data?.message) {
        serverError = error.response.data.message;
      } else if (error.message) {
        serverError = error.message;
      }

      const errorMessage = `Failed to ${isEditing ? 'update' : 'create'} user: ${serverError}`;
      setErrorMessage(errorMessage);

      // Show error toaster
      showToaster(false, 'Error', errorMessage);

      setCreateLoading(false);
    } finally {
      setSubmitting(false);
      setCreateLoading(false);
    }
  };

  // Action Handlers
  const handleDeleteUser = async (userId, reason) => {
    setSubmitting(true);
    try {
      const response = await DELETE(URLS.USERS.DELETE_USER.replace(':id', userId), { reason });
      const user = users.find(u => u.id === userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
      showToaster(true, 'Success', `User "${userName}" deleted successfully!`);
      await fetchUsersAndBusinesses();
      closeModal();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMsg = 'Failed to delete user. Please try again.';
      setErrorMessage(errorMsg);
      showToaster(false, 'Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, newStatus, reason) => {
    setSubmitting(true);
    try {
      const response = await PUT(URLS.USERS.TOGGLE_USER_STATUS.replace(':id', userId), {
        status: newStatus,
        reason: reason
      });

      const user = users.find(u => u.id === userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
      const statusMessage = newStatus === 'active' ? 'enabled' : 'disabled';

      showToaster(true, 'Success', `User "${userName}" ${statusMessage} successfully!`);

      await fetchUsersAndBusinesses();
      closeModal();
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMsg = 'Failed to update user status. Please try again.';
      setErrorMessage(errorMsg);

      // Show error toaster
      showToaster(false, 'Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnableUser = async (userId) => {
    setSubmitting(true);
    try {
      await handleToggleStatus(userId, 'active', 'Enabled via EnableUserView');
      closeAllModals();
    } catch (error) {
      console.error('Error enabling user:', error);
      showToaster(false, 'Error', 'Failed to enable user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectUser = () => {
    // Show info toaster when user is rejected
    showToaster(undefined, 'Info', 'User request has been rejected.');
    closeAllModals();
  };

  // Selection Handlers
  const toggleSelectAll = (filteredList) => {
    if (selectedItems.length === filteredList.length && filteredList.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredList.map(u => u.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const firstName = u.firstName || '';
    const lastName = u.lastName || '';
    const email = u.email || '';
    const username = u.username || '';
    const institutionName = u.institutionName || '';

    const matchesSearch =
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institutionName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || u.status === filters.status;
    const matchesRole = !filters.role || u.role === filters.role;
    const matchesBusiness = !filters.business || u.institutionName === filters.business;

    return matchesSearch && matchesStatus && matchesRole && matchesBusiness;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'INACTIVE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (createLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={createLoadingText}
                loadedText=""
                color={theme.primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={loadingState}
                loading={true}
                loadingText={loadingText}
                loadedText={loadedText}
                color={theme.primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (formModalLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={formLoadingText}
                loadedText=""
                color={theme.primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (actionModalLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={actionLoadingText}
                loadedText=""
                color={theme.primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
      case 'edit':
        return (
          <CreateUserForm
            showModal={true}
            setShowModal={closeAllModals}
            initialFormData={editingUser || {}}
            handleSubmit={handleFormSubmit}
            businesses={businesses}
            rolesByType={rolesByType}
            isEditing={isEditing}
            submitting={submitting}
          />
        );

      case 'enable':
        return (
          <EnableUserView
            user={editingUser}
            onClose={closeAllModals}
            onEnable={() => handleEnableUser(editingUser?.id)}
            onReject={handleRejectUser}
            submitting={submitting}
          />
        );

      case 'table':
      default:
        return (
          <>
            {users.length === 0 && filteredUsers.length === 0 && !searchTerm ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Users size={64} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! No Users</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first user</p>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Plus size={20} />
                  Add User
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <span className="text-2xl font-bold text-gray-900">Users</span>
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-800">{errorMessage}</p>
                    </div>
                  )}
                  <UsersControls
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    openModal={openCreateModal}
                  />

                  <UsersTable
                    filteredUsers={filteredUsers}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    toggleSelectAll={() => toggleSelectAll(filteredUsers)}
                    toggleSelectItem={toggleSelectItem}
                    openModalForEdit={openEditModal}
                    openEnableView={openEnableViewModal}
                    openEnableModal={openEnableModal}
                    openDisableModal={openDisableModal}
                    openDeleteModal={openDeleteModal}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    submitting={submitting}
                    formatDate={formatDate}
                    getInitials={getInitials}
                  />
                </div>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={(open) => setToaster({ ...toaster, open })}
        position="right"
      />

      <div className="max-w-7xl mx-auto">
        {modalState.isOpen && (
          <ActionModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            entityName={modalState.entityName}
            actionType={modalState.actionType}
            reason={modalState.reason}
            setReason={setReason}
            onSubmit={handleSubmit}
            submitting={submitting}
            customDescription={modalState.customDescription}
          />
        )}

        {!modalState.isOpen && renderCurrentView()}
      </div>
    </div>
  );
};

export default UsersPage;