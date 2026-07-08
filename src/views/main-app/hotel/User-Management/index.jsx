import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Users, Plus } from 'lucide-react';
import { useTheme } from "../../../../components/theme/ThemeContext";
import { useSelector } from "react-redux";
import { GET, POST, PUT, DELETE } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

// Reuse the generic sub-components from kiosk (no kiosk-specific code inside them)
import StaffControls from "../../kiosk/User-Management/StaffControls";
import StaffTable from "../../kiosk/User-Management/StaffTable";
import CreateStaffForm from "../../kiosk/User-Management/CreateStaffForm";
import StaffViewDialog from "../../kiosk/User-Management/StaffViewDialog";
import Toaster from "../../../../components/Toaster";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useActionModal } from "../../../../hooks/useActionModal";
import ActionModal from "../../../../components/modal/ActionModal";

const HotelStaffManagement = () => {
  const theme = useTheme();
  const primaryColor = theme?.primaryColor || '#2563eb';

  const currentUser = useSelector((state) => state.auth?.value);

  // Data states
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [filters, setFilters] = useState({ status: '', role: '', startDate: null, endDate: null });

  const [toaster, setToaster] = useState({ open: false, state: "true", title: "", message: "" });

  // Roles must match what super admin sends — space-separated title case
  const rolesByType = useMemo(() => ({
    'Hotel': ['Hotel Admin', 'Hotel Cashier', 'Hotel Waiter']
  }), []);

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
        name: currentUser.businessName || "Your Hotel",
        type: currentUser.businessType || "Hotel"
      };
    }

    return {
      id: businessId,
      name: currentUser.businessName || "Current Hotel",
      type: currentUser.businessType || "Hotel"
    };
  }, [currentUser]);

  const availableRoles = useMemo(() => {
    return rolesByType[currentBusiness?.type] || rolesByType['Hotel'];
  }, [currentBusiness, rolesByType]);

  // View state
  const [currentView, setCurrentView] = useState('table');
  const [currentStaff, setCurrentStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Loading states
  const [actionModalLoading, setActionModalLoading] = useState(false);
  const [actionLoadingText, setActionLoadingText] = useState('');
  const [formModalLoading, setFormModalLoading] = useState(false);
  const [formLoadingText, setFormLoadingText] = useState('');
  const [loadingState, setLoadingState] = useState(true);
  const [loadingText, setLoadingText] = useState("");
  const [loadedText, setLoadedText] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createLoadingText, setCreateLoadingText] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  const { modalState, openModal, closeModal, setReason, handleSubmit } = useActionModal();

  const showToaster = useCallback((title, message, type = "success") => {
    const stateMap = { success: "true", error: "false", warning: "warning", info: "warning" };
    setToaster({ open: true, state: stateMap[type] || "true", title, message });
  }, []);

  const handleCloseToaster = useCallback(() => {
    setToaster((prev) => ({ ...prev, open: false }));
  }, []);

  const getInitials = useCallback((name) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }, []);

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setLoadingText("Loading staff data...");
    setErrorMessage(null);

    try {
      if (!currentUser?.id) throw new Error("User information not available. Please log in again.");

      const userBusinessId = String(
        currentUser.businessId ||
        currentUser.businessUUID ||
        currentUser.associatedBusinessId ||
        currentUser.institutionId ||
        ""
      ).trim();

      if (!userBusinessId) throw new Error("No business assigned to your account. Please contact your administrator.");

      let staffData = [];

      try {
        const result = await GET(`/api/users/business/${userBusinessId}`);
        if (result?.success && Array.isArray(result.data)) {
          staffData = result.data;
        }
      } catch (_) {
        // fall through to all-users fallback
      }

      if (staffData.length === 0) {
        try {
          const allUsersResult = await GET(URLS.USERS.GET_ALL_USERS || '/api/users');
          if (allUsersResult?.success && Array.isArray(allUsersResult.data)) {
            staffData = allUsersResult.data.filter(user => {
              if (!user) return false;
              const belongsToCurrentBusiness =
                String(user.businessId || "").trim() === userBusinessId ||
                String(user.businessUUID || "").trim() === userBusinessId ||
                String(user.associatedBusinessId || "").trim() === userBusinessId ||
                String(user.institutionId || "").trim() === userBusinessId;

              // Backend returns Hotel_Admin but we store/create as "Hotel Admin"
              const norm = (r) => (r || '').replace(/_/g, ' ');
              const hasValidRole = user.role && availableRoles.some(r => norm(r) === norm(user.role));
              return belongsToCurrentBusiness && hasValidRole;
            });
          }
        } catch (err) {
          throw new Error("Cannot connect to server. Please check your connection.");
        }
      }

      if (staffData.length === 0) {
        setStaff([]);
        setLoadedText("No staff members found for your hotel");
        showToaster("No Staff Found", "You can add new staff using the 'Add Staff' button.", "info");
        return;
      }

      const transformedStaff = staffData.map(member => ({
        id: member._id || member.id,
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.email || "",
        username: member.username || "",
        phone: member.phone || member.phoneNumber || "",
        phoneNumber: member.phoneNumber || member.phone || "",
        role: member.role || "",
        status: (member.status || 'ACTIVE').toUpperCase(),
        businessId: member.businessId || member.associatedBusinessId || userBusinessId,
        associatedBusinessId: member.associatedBusinessId || userBusinessId,
        institutionId: member.institutionId || userBusinessId,
        businessName: member.businessName || currentBusiness?.name || "Current Hotel",
        businessType: member.businessType || currentBusiness?.type || "Hotel",
        dateJoined: member.createdAt || member.dateJoined || new Date().toISOString(),
        lastLogin: member.lastLogin,
        createdAt: member.createdAt,
      }));

      setStaff(transformedStaff);
      setLoadedText(`Loaded ${transformedStaff.length} staff member(s)`);
      showToaster("Success", `Successfully loaded ${transformedStaff.length} staff member(s)`, "success");

    } catch (error) {
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
      if (!currentBusinessId || memberBusinessId !== currentBusinessId) return false;
      const norm = (r) => (r || '').replace(/_/g, ' ').toLowerCase();
      if (!availableRoles.some(r => norm(r) === norm(member.role))) return false;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (member.firstName?.toLowerCase() || '').includes(searchLower) ||
        (member.lastName?.toLowerCase() || '').includes(searchLower) ||
        (member.email?.toLowerCase() || '').includes(searchLower) ||
        (member.phone?.toLowerCase() || '').includes(searchLower) ||
        (member.username?.toLowerCase() || '').includes(searchLower) ||
        (member.role?.toLowerCase() || '').includes(searchLower);

      const matchesStatus = !filters.status || member.status === filters.status;
      const matchesRole = !filters.role || norm(member.role) === norm(filters.role);

      let matchesDate = true;
      if (filters.startDate && filters.endDate) {
        const memberDate = member.createdAt || member.dateJoined;
        if (memberDate) {
          const d = new Date(memberDate);
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = d >= new Date(filters.startDate) && d <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesRole && matchesDate;
    });
  }, [staff, searchTerm, filters, currentBusiness, availableRoles]);

  const toggleSelectAll = useCallback(() => {
    setSelectedItems(
      selectedItems.length === filteredStaff.length && filteredStaff.length > 0
        ? []
        : filteredStaff.map(s => s.id)
    );
  }, [filteredStaff, selectedItems]);

  const toggleSelectItem = useCallback((id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const openActionModalWithLoader = async (actionType, staffMember) => {
    setActionModalLoading(true);
    const labels = { disable: 'Preparing to disable staff...', enable: 'Preparing to enable staff...', delete: 'Preparing to delete staff...' };
    setActionLoadingText(labels[actionType] || 'Loading...');
    await new Promise(resolve => setTimeout(resolve, 800));

    const staffName = `${staffMember.firstName} ${staffMember.lastName}`;
    const actions = {
      disable: () => openModal('disable', staffMember.id, staffName, 'staff',
        (id, reason) => handleToggleStatus(id, 'inactive', reason),
        `You are about to disable "${staffName}". They will lose access.`),
      enable: () => openModal('enable', staffMember.id, staffName, 'staff',
        (id, reason) => handleToggleStatus(id, 'active', reason),
        `You are about to enable "${staffName}". This will restore their access.`),
      delete: () => openModal('delete', staffMember.id, staffName, 'staff',
        (id, reason) => handleDeleteStaff(id, reason),
        `You are about to permanently delete "${staffName}".`),
    };
    actions[actionType]?.();
    setActionModalLoading(false);
  };

  const openFormModalWithLoader = async (modalType, staffMember = null) => {
    setFormModalLoading(true);
    const labels = { create: 'Loading create form...', edit: 'Loading edit form...', view: 'Loading staff details...' };
    setFormLoadingText(labels[modalType] || 'Loading...');
    await new Promise(resolve => setTimeout(resolve, 800));

    if (modalType === 'edit' && staffMember) {
      setCurrentStaff({
        ...staffMember,
        phone: staffMember.phone || staffMember.phoneNumber || "",
        phoneNumber: staffMember.phoneNumber || staffMember.phone || "",
        role: staffMember.role || availableRoles[0],
        status: staffMember.status || "ACTIVE",
        businessId: staffMember.businessId || currentBusiness?.id,
      });
    } else {
      setCurrentStaff(staffMember);
    }

    setIsEditing(modalType === 'edit');
    setCurrentView(modalType);
    setFormModalLoading(false);
  };

  const closeAllModals = () => {
    setCurrentView('table');
    setCurrentStaff(null);
    setErrorMessage(null);
    setCreateLoading(false);
    setCreateSuccess(false);
    setSubmitting(false);
    closeModal();
  };

  const businessForForm = useMemo(() => {
    if (!currentBusiness) return [];
    return [{ id: currentBusiness.id, businessId: currentBusiness.id, _id: currentBusiness.id, businessName: currentBusiness.name, businessType: currentBusiness.type }];
  }, [currentBusiness]);

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (!values) throw new Error('Form values are missing');

      const safeTrim = (v) => (v === null || v === undefined ? '' : String(v).trim());
      const firstName  = safeTrim(values.firstName);
      const lastName   = safeTrim(values.lastName);
      const email      = safeTrim(values.email);
      const username   = safeTrim(values.username);
      const phone      = safeTrim(values.phone || values.phoneNumber);
      const role       = values.role || '';
      const status     = values.status || 'ACTIVE';
      const businessId = values.businessId || values.institutionId || '';

      if (!firstName)  throw new Error('First name is required');
      if (!lastName)   throw new Error('Last name is required');
      if (!email)      throw new Error('Email is required');
      if (!username)   throw new Error('Username is required');
      if (!phone)      throw new Error('Phone number is required');
      if (!role)       throw new Error('Role is required');
      if (!businessId) throw new Error('Business is required');

      if (!availableRoles.includes(role)) {
        throw new Error(`Invalid role. Please choose from: ${availableRoles.join(', ')}`);
      }

      if (String(businessId).trim() !== String(currentBusiness.id || "").trim()) {
        throw new Error("Invalid business selection.");
      }

      const staffData = {
        firstName, lastName, email, username,
        phone, phoneNumber: phone,
        role,
        status: status === "ACTIVE" ? "active" : "inactive",
        businessId: currentBusiness.id,
        associatedBusinessId: currentBusiness.id,
        institutionId: currentStaff?.institutionId || currentBusiness.id,
        businessName: currentBusiness.name,
        businessType: currentBusiness.type,
        updatedBy: currentUser?.id || "system",
        updatedAt: new Date().toISOString(),
      };

      if (!isEditing) staffData.password = 'Temporary123!';

      const staffName = `${firstName} ${lastName}`;
      let result;

      if (isEditing && currentStaff) {
        result = await PUT(URLS.USERS.UPDATE_USER.replace(':id', currentStaff.id), staffData);
        if (result?.success) {
          setStaff(prev => prev.map(m => m.id === currentStaff.id
            ? { ...m, firstName, lastName, email, username, phone, phoneNumber: phone, role, status, businessId: currentBusiness.id }
            : m
          ));
          // Show success loader only after confirmed success
          setCreateLoading(true);
          setCreateSuccess(true);
          setCreateLoadingText(`✓ ${staffName} has been updated successfully.`);
          await new Promise(r => setTimeout(r, 2000));
          showToaster("Staff Updated", `${staffName} has been updated successfully`, "success");
          closeAllModals();
        } else {
          throw new Error(result?.message || "Failed to update staff member");
        }
      } else {
        result = await POST(URLS.USERS.CREATE_USER, staffData);
        if (result?.success && result.user) {
          const newStaff = {
            id: result.user.id || result.user._id,
            firstName, lastName, email, username,
            phone, phoneNumber: phone, role, status,
            businessId: currentBusiness.id,
            associatedBusinessId: currentBusiness.id,
            institutionId: currentBusiness.id,
            businessName: currentBusiness.name,
            businessType: currentBusiness.type,
            dateJoined: result.user.createdAt || new Date().toISOString(),
          };
          setStaff(prev => [newStaff, ...prev]);
          // Show success loader only after confirmed success
          setCreateLoading(true);
          setCreateSuccess(true);
          setCreateLoadingText(`✓ ${staffName} has been added to your team.`);
          await new Promise(r => setTimeout(r, 2000));
          showToaster("Staff Created", `${staffName} has been added to your team`, "success");
          closeAllModals();
        } else {
          throw new Error(result?.message || "Failed to create staff member");
        }
      }
    } catch (error) {
      // Keep the form mounted — just show the error and let the user fix it
      const errorMsg = error.message || 'Failed to save staff member. Please try again.';
      setErrorMessage(errorMsg);
      showToaster("Error", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId, reason) => {
    setSubmitting(true);
    try {
      const result = await DELETE(URLS.USERS.DELETE_USER.replace(':id', staffId));
      if (result?.success) {
        setStaff(prev => prev.filter(m => m.id !== staffId));
        showToaster("Staff Deleted", "Staff member deleted successfully", "success");
        closeModal();
      } else {
        throw new Error(result?.message || "Failed to delete staff member");
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete staff member.');
      showToaster("Error", error.message || 'Failed to delete staff member', "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffId, newStatus, reason) => {
    setSubmitting(true);
    try {
      const result = await PUT(URLS.USERS.TOGGLE_USER_STATUS.replace(':id', staffId), {
        status: newStatus === 'active' ? 'active' : 'inactive',
        reason: reason || "Status updated by admin"
      });
      if (result?.success) {
        setStaff(prev => prev.map(m => m.id === staffId
          ? { ...m, status: newStatus === 'active' ? 'ACTIVE' : 'INACTIVE' }
          : m
        ));
        showToaster("Status Updated", "Staff status updated successfully", "success");
        closeModal();
      } else {
        throw new Error(result?.message || "Failed to update staff status");
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update staff status.');
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

  // ── Loading screens ──────────────────────────────────────────
  const loadingScreen = (text) => (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="main-app-view">
          <div className="main-app-content-container">
            <ContentLoader state={true} loading={true} loadingText={text} loadedText="" color={primaryColor} />
          </div>
        </div>
      </div>
    </div>
  );

  if (createLoading) return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="main-app-view">
          <div className="main-app-content-container">
            <ContentLoader
              state={!createSuccess}
              loading={!createSuccess}
              loadingText={createLoadingText}
              loadedText={createSuccess ? createLoadingText : ""}
              color={createSuccess ? '#10b981' : primaryColor}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return loadingScreen(loadingText || "Loading staff data...");
  if (formModalLoading) return loadingScreen(formLoadingText);
  if (actionModalLoading) return loadingScreen(actionLoadingText);

  if (errorMessage?.includes("Forbidden")) return (
    <div className="min-h-screen bg-white p-8">
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">Access Denied</div>
        <div className="text-gray-600 mb-6">{errorMessage}</div>
        <button onClick={fetchStaffData} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Retry Loading Staff
        </button>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
      case 'edit':
        return (
          <CreateStaffForm
            showModal={true}
            setShowModal={closeAllModals}
            initialFormData={currentStaff || { status: "ACTIVE" }}
            handleSubmit={handleFormSubmit}
            businesses={businessForForm}
            rolesByType={rolesByType}
            isEditing={isEditing}
            submitting={submitting}
            forceBusinessId={currentBusiness.id}
            lockedBusiness={true}
            availableRoles={availableRoles}
          />
        );
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
      default:
        return staff.length === 0 && filteredStaff.length === 0 && !searchTerm ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Users size={64} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Staff Members</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first staff member</p>
            <button
              onClick={() => openFormModalWithLoader('create')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={20} /> Add Staff
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="text-2xl font-bold text-gray-900">Staff Management</span>
            <StaffControls
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              openModal={() => openFormModalWithLoader('create')}
              filterRoles={availableRoles.map(role => ({ label: role.replace('_', ' '), value: role }))}
            />
            <StaffTable
              filteredStaff={filteredStaff}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              toggleSelectAll={toggleSelectAll}
              toggleSelectItem={toggleSelectItem}
              openModalForEdit={(m) => openFormModalWithLoader('edit', m)}
              openEnableView={(m) => openFormModalWithLoader('view', m)}
              openEnableModal={(m) => openActionModalWithLoader('enable', m)}
              openDisableModal={(m) => openActionModalWithLoader('disable', m)}
              openDeleteModal={(m) => openActionModalWithLoader('delete', m)}
              getInitials={getInitials}
              formatDate={formatDate}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              submitting={submitting}
            />
          </div>
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

export default HotelStaffManagement;
