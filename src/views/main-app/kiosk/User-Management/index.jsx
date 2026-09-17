import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Plus } from 'lucide-react';
import { useTheme } from "../../../../components/theme/ThemeContext";
import { useSelector } from "react-redux";
import { GET, PUT, DELETE } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

// Import the components
import StaffControls from "./StaffControls";
import StaffTable from "./StaffTable";
import StaffViewDialog from "./StaffViewDialog";
import Toaster from "../../../../components/Toaster";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useActionModal } from "../../../../hooks/useActionModal";
import ActionModal from "../../../../components/modal/ActionModal";

// Role lists per business type — must match the space-separated role strings
// the super admin uses when creating users (see CreateUserPage's rolesByType).
const ROLES_BY_BUSINESS_TYPE = {
  Kiosk: ['Kiosk Admin', 'Kiosk Shopkeeper'],
  Hotel: ['Hotel Admin', 'Hotel Cashier', 'Hotel Waiter'],
};

// Treats "Kiosk_Admin", "Kiosk-Admin" and "Kiosk Admin" as equivalent, so
// matching stays correct regardless of which separator the backend stored.
const normalizeRole = (role) => (role || '').replace(/[_-]/g, ' ').toLowerCase().trim();

const StaffManagementPage = ({ basePath = '/kiosk/user-management' }) => {
  const theme = useTheme();
  const primaryColor = theme?.primaryColor || '#2563eb';
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth?.value);

  // Data states
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    startDate: null,
    endDate: null
  });

  // Toaster state - Updated for custom Toaster component
  const [toaster, setToaster] = useState({
    open: false,
    state: "true", // "true" = success, "false" = error, anything else = warning
    title: "",
    message: "",
  });

  // Get current user's business info
  const currentBusiness = useMemo(() => {
    if (!currentUser) return null;

    const businessId = String(
      currentUser.businessId ||
      currentUser.businessUUID ||
      currentUser.associatedBusinessId ||
      currentUser.institutionId ||
      ""
    ).trim();

    if (!businessId) {
      return {
        id: 'unknown',
        name: currentUser.businessName || "Your Business",
        type: currentUser.businessType || ""
      };
    }

    return {
      id: businessId,
      name: currentUser.businessName || "Current Business",
      type: currentUser.businessType || ""
    };
  }, [currentUser]);

  // View state
  const [currentView, setCurrentView] = useState('table');
  const [currentStaff, setCurrentStaff] = useState(null);

  // Modal loading states
  const [actionModalLoading, setActionModalLoading] = useState(false);
  const [actionLoadingText, setActionLoadingText] = useState('');
  const [formModalLoading, setFormModalLoading] = useState(false);
  const [formLoadingText, setFormLoadingText] = useState('');
  const [loadingState, setLoadingState] = useState(true);
  const [loadingText, setLoadingText] = useState("");
  const [loadedText, setLoadedText] = useState("");

  // Reusable action modal hook
  const { modalState, openModal, closeModal, setReason, handleSubmit } = useActionModal();

  // Toaster functions
  const showToaster = useCallback((title, message, type = "success") => {
    const stateMap = {
      success: "true",
      error: "false",
      warning: "warning",
      info: "warning"
    };

    setToaster({
      open: true,
      state: stateMap[type] || "true",
      title: title,
      message: message
    });
  }, []);

  const handleCloseToaster = useCallback(() => {
    setToaster((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    if (location.state?.toast) {
      const { state, title, message } = location.state.toast;
      showToaster(title, message, state ? 'success' : 'error');
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Helper Functions
  const getInitials = useCallback((name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  // Available roles for the current business type — empty until we know the type
  const availableRoles = useMemo(() => {
    return ROLES_BY_BUSINESS_TYPE[currentBusiness?.type] || [];
  }, [currentBusiness]);

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setLoadingText("Loading staff data...");
    setErrorMessage(null);

    try {
      if (!currentUser?.id) {
        throw new Error("User information not available. Please log in again.");
      }

      const userBusinessId = String(
        currentUser.businessId ||
        currentUser.businessUUID ||
        currentUser.associatedBusinessId ||
        currentUser.institutionId ||
        ""
      ).trim();

      if (!userBusinessId) {
        throw new Error("No business assigned to your account. Please contact your administrator.");
      }

      let staffData = [];

      try {
        const businessEndpoint = `/api/users/business/${userBusinessId}`;
        const result = await GET(businessEndpoint);

        if (result?.success && Array.isArray(result.data)) {
          staffData = result.data;
        }
      } catch (businessError) {
        // Fall through to the all-users endpoint below
      }

      if (staffData.length === 0) {
        try {
          const allUsersEndpoint = URLS.USERS.GET_ALL_USERS || '/api/users';
          const allUsersResult = await GET(allUsersEndpoint);

          if (allUsersResult?.success && Array.isArray(allUsersResult.data)) {
            staffData = allUsersResult.data.filter(user => {
              if (!user) return false;

              const userBusinessNumericId = String(user.businessId || "").trim();
              const userBusinessUUID = String(user.businessUUID || "").trim();
              const userAssociatedBusinessId = String(user.associatedBusinessId || "").trim();
              const userInstitutionId = String(user.institutionId || "").trim();

              const belongsToCurrentBusiness =
                userBusinessNumericId === userBusinessId ||
                userBusinessUUID === userBusinessId ||
                userAssociatedBusinessId === userBusinessId ||
                userInstitutionId === userBusinessId;

              const hasValidRole = user.role &&
                availableRoles.some(role => normalizeRole(role) === normalizeRole(user.role));

              return belongsToCurrentBusiness && hasValidRole;
            });
          }
        } catch (allUsersError) {
          console.error('Failed to fetch all users:', allUsersError);
          throw new Error("Cannot connect to server. Please check your connection.");
        }
      }

      if (staffData.length === 0) {
        setStaff([]);
        setLoadedText("No staff members found for your business");
        showToaster("No Staff Found", "You can add new staff using the 'Add Staff' button.", "info");
        return;
      }

      const transformedStaff = staffData.map(member => {
        const memberBusinessId = member.businessId || member.associatedBusinessId || userBusinessId;
        const memberBusinessName = member.businessName || currentBusiness?.name || "Current Business";
        const memberBusinessType = member.businessType || currentBusiness?.type || "";

        return {
          id: member._id || member.id,
          firstName: member.firstName || "",
          lastName: member.lastName || "",
          email: member.email || "",
          username: member.username || "",
          phone: member.phone || member.phoneNumber || "",
          phoneNumber: member.phoneNumber || member.phone || "",
          role: member.role || "",
          status: (member.status || 'ACTIVE').toUpperCase(),
          businessId: memberBusinessId,
          associatedBusinessId: member.associatedBusinessId || memberBusinessId,
          institutionId: member.institutionId || memberBusinessId,
          businessName: memberBusinessName,
          businessType: memberBusinessType,
          dateJoined: member.createdAt || member.dateJoined || new Date().toISOString(),
          lastLogin: member.lastLogin,
          createdAt: member.createdAt,
        };
      });

      setStaff(transformedStaff);
      setLoadedText(`Loaded ${transformedStaff.length} staff member(s)`);
      showToaster("Success", `Successfully loaded ${transformedStaff.length} staff member(s)`, "success");

    } catch (error) {
      console.error('Error fetching staff data:', error);
      const errorMsg = error.message || "Failed to load staff data. Please try again.";
      setErrorMessage(errorMsg);
      showToaster("Error Loading Staff", errorMsg, "error");
      setStaff([]);
    } finally {
      setLoading(false);
      setLoadingState(false);
    }
  }, [currentBusiness, currentUser, availableRoles, showToaster]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staff)) return [];

    return staff.filter((member) => {
      if (!member) return false;

      const memberBusinessId = String(member.businessId || "").trim();
      const currentBusinessId = String(currentBusiness?.id || "").trim();

      if (!currentBusinessId || memberBusinessId !== currentBusinessId) {
        return false;
      }

      if (!availableRoles.some(role => normalizeRole(role) === normalizeRole(member.role))) {
        return false;
      }

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (member.firstName?.toLowerCase() || '').includes(searchLower) ||
        (member.lastName?.toLowerCase() || '').includes(searchLower) ||
        (member.email?.toLowerCase() || '').includes(searchLower) ||
        (member.phone?.toLowerCase() || '').includes(searchLower) ||
        (member.username?.toLowerCase() || '').includes(searchLower) ||
        (member.role?.toLowerCase() || '').includes(searchLower);

      const matchesStatus = !filters.status || member.status === filters.status;
      const matchesRole = !filters.role || normalizeRole(member.role) === normalizeRole(filters.role);

      // Add date filtering logic
      let matchesDate = true;
      if (filters.startDate && filters.endDate) {
        const memberDate = member.createdAt || member.dateJoined;
        if (memberDate) {
          const memberDateObj = new Date(memberDate);
          const startDate = new Date(filters.startDate);
          const endDate = new Date(filters.endDate);
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);

          matchesDate = memberDateObj >= startDate && memberDateObj <= endDate;
        }
      }

      return matchesSearch && matchesStatus && matchesRole && matchesDate;
    });
  }, [staff, searchTerm, filters, currentBusiness, availableRoles]);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredStaff.length && filteredStaff.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredStaff.map(s => s.id));
    }
  }, [filteredStaff, selectedItems]);

  const toggleSelectItem = useCallback((id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const openActionModalWithLoader = async (actionType, staffMember) => {
    setActionModalLoading(true);

    switch (actionType) {
      case 'disable':
        setActionLoadingText('Preparing to disable staff...');
        break;
      case 'enable':
        setActionLoadingText('Preparing to enable staff...');
        break;
      case 'delete':
        setActionLoadingText('Preparing to delete staff...');
        break;
      default:
        setActionLoadingText('Loading...');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const staffName = `${staffMember.firstName} ${staffMember.lastName}` || 'Staff Member';

    switch (actionType) {
      case 'disable':
        openModal(
          'disable',
          staffMember.id,
          staffName,
          'staff',
          (id, reason) => handleToggleStatus(id, 'inactive', reason),
          `You are about to disable "${staffName}". By disabling, this staff member will no longer have access.`
        );
        break;
      case 'enable':
        openModal(
          'enable',
          staffMember.id,
          staffName,
          'staff',
          (id, reason) => handleToggleStatus(id, 'active', reason),
          `You are about to enable "${staffName}". This will restore their access.`
        );
        break;
      case 'delete':
        openModal(
          'delete',
          staffMember.id,
          staffName,
          'staff',
          (id, reason) => handleDeleteStaff(id, reason),
          `You are about to delete "${staffName}". This will permanently remove the staff member account.`
        );
        break;
      default:
        console.warn('Unknown action type:', actionType);
    }

    setActionModalLoading(false);
  };

  const openFormModalWithLoader = async (staffMember = null) => {
    setFormModalLoading(true);
    setFormLoadingText('Loading staff details...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    setCurrentStaff(staffMember);
    setCurrentView('view');
    setFormModalLoading(false);
  };

  const closeAllModals = () => {
    setCurrentView('table');
    setCurrentStaff(null);
    setErrorMessage(null);
    setSubmitting(false);
    closeModal();
  };

  const openCreateModal = () => navigate(`${basePath}/new`);

  const openEditModal = (staffMember) => {
    if (!staffMember) return;
    navigate(`${basePath}/${staffMember.id}/edit`);
  };

  const openViewModal = (staffMember) => openFormModalWithLoader(staffMember);
  const openEnableModal = (staffMember) => openActionModalWithLoader('enable', staffMember);
  const openDisableModal = (staffMember) => openActionModalWithLoader('disable', staffMember);
  const openDeleteModal = (staffMember) => openActionModalWithLoader('delete', staffMember);

  // Action Handlers
  const handleDeleteStaff = async (staffId, reason) => {
    setSubmitting(true);
    try {
      const endpoint = URLS.USERS.DELETE_USER.replace(':id', staffId);
      const result = await DELETE(endpoint);

      if (result && result.success) {
        setStaff((prevStaff) => prevStaff.filter((member) => member.id !== staffId));
        showToaster("Staff Deleted", "Staff member deleted successfully", "success");
        closeModal();
      } else {
        throw new Error(result?.message || "Failed to delete staff member");
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      setErrorMessage(error.message || 'Failed to delete staff member. Please try again.');
      showToaster("Error", error.message || 'Failed to delete staff member', "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffId, newStatus, reason) => {
    setSubmitting(true);
    try {
      const endpoint = URLS.USERS.TOGGLE_USER_STATUS.replace(':id', staffId);
      const result = await PUT(endpoint, {
        status: newStatus === 'active' ? 'active' : 'inactive',
        reason: reason || "Status updated by admin"
      });

      if (result && result.success) {
        setStaff((prevStaff) =>
          prevStaff.map((member) =>
            member.id === staffId
              ? {
                ...member,
                status: newStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
              }
              : member
          )
        );
        showToaster("Status Updated", "Staff status updated successfully", "success");
        closeModal();
      } else {
        throw new Error(result?.message || "Failed to update staff status");
      }
    } catch (error) {
      console.error('Error toggling staff status:', error);
      setErrorMessage(error.message || 'Failed to update staff status. Please try again.');
      showToaster("Error", error.message || 'Failed to update staff status', "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnableStaff = async (staffId) => {
    setSubmitting(true);
    try {
      await handleToggleStatus(staffId, 'active', 'Enabled via staff view');
      closeAllModals();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectStaff = () => {
    closeAllModals();
  };

  // Show content loader during initial loading
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
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show content loader during form modal loading
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
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show content loader during action modal loading
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
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show specific access error
  if (errorMessage && errorMessage.includes("Forbidden")) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">
              Access Denied
            </div>
            <div className="text-gray-600 mb-6">
              {errorMessage}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-lg mx-auto">
              <p className="text-yellow-800 font-semibold mb-2">Possible Solutions:</p>
              <ul className="text-left text-gray-700 text-sm space-y-1">
                <li>• Ensure you're logged in as an admin for {currentBusiness.name}</li>
                <li>• Contact support to verify your business assignment</li>
                <li>• Try refreshing the page</li>
                <li>• Clear browser cache and login again</li>
              </ul>
            </div>
            <button
              onClick={fetchStaffData}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Loading Staff
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'view':
        return (
          <StaffViewDialog
            show={true}
            onClose={closeAllModals}
            staff={currentStaff}
            onEnable={() => openActionModalWithLoader('enable', currentStaff)}
            onDisable={() => openActionModalWithLoader('disable', currentStaff)}
            onReject={closeAllModals}
            submitting={submitting}
            currentBusiness={currentBusiness}
          />
        );

      case 'table':
      default:
        return (
          <>
            {staff.length === 0 && filteredStaff.length === 0 && !searchTerm ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Users size={64} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! No Staff Members</h3>
                <p className="text-gray-500 mb-2">Business: {currentBusiness.name}</p>
                <p className="text-gray-500 mb-2">Business ID: {currentBusiness.id}</p>
                <p className="text-gray-500 mb-6">Get started by adding your first staff member</p>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Plus size={20} />
                  Add Staff
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">Staff Management</span>
                    </div>
                  </div>
                  <StaffControls
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    openModal={openCreateModal}
                    filterRoles={availableRoles.map(role => ({
                      label: role.replace('_', ' '),
                      value: role
                    }))}
                  />

                  <StaffTable
                    filteredStaff={Array.isArray(filteredStaff) ? filteredStaff : []}
                    selectedItems={Array.isArray(selectedItems) ? selectedItems : []}
                    setSelectedItems={setSelectedItems}
                    toggleSelectAll={toggleSelectAll}
                    toggleSelectItem={toggleSelectItem}
                    openModalForEdit={openEditModal}
                    openEnableView={openViewModal}
                    openEnableModal={openEnableModal}
                    openDisableModal={openDisableModal}
                    openDeleteModal={openDeleteModal}
                    getInitials={getInitials}
                    formatDate={formatDate}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    submitting={submitting}
                  />
                </div>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        {modalState.isOpen && (
          <ActionModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            entityName={modalState.entityName}
            entityType={modalState.entityType}
            actionType={modalState.actionType}
            reason={modalState.reason}
            setReason={setReason}
            onSubmit={handleSubmit}
            submitting={submitting}
            customDescription={modalState.customDescription}
          />
        )}

        {!modalState.isOpen && renderCurrentView()}

        <Toaster
          open={toaster.open}
          state={toaster.state}
          title={toaster.title}
          message={toaster.message}
          action={handleCloseToaster}
          position="right"
        />
      </div>
    </div>
  );
};

export default StaffManagementPage;