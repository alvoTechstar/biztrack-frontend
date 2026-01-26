import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import { Users, Plus } from 'lucide-react';
import { useTheme } from "../../../../components/theme/ThemeContext";
import { useSelector } from "react-redux";
import { GET, POST, PUT, DELETE } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

// Import the components
import StaffControls from "./StaffControls";
import StaffTable from "./StaffTable";
import CreateStaffForm from "./CreateStaffForm";
import StaffViewDialog from "./StaffViewDialog";
import Toaster from "../../../../components/Toaster";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useActionModal } from "../../../../hooks/useActionModal";
import ActionModal from "../../../../components/modal/ActionModal";

const KioskStaffManagement = () => {
  const theme = useTheme();
  const primaryColor = theme?.primaryColor || '#2563eb';

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

    console.log('🔍 Current User for business info:', currentUser);

    const businessId = String(
      currentUser.businessId ||
      currentUser.businessUUID ||
      currentUser.associatedBusinessId ||
      currentUser.institutionId ||
      ""
    ).trim();

    if (!businessId) {
      console.warn('⚠️ No business ID found in currentUser. Will determine from database.');
      return {
        id: 'unknown',
        name: currentUser.businessName || "Your Business",
        type: currentUser.businessType || "Kiosk"
      };
    }

    return {
      id: businessId,
      name: currentUser.businessName || "Current Business",
      type: currentUser.businessType || "Kiosk"
    };
  }, [currentUser]);

  // View state
  const [currentView, setCurrentView] = useState('table');
  const [currentStaff, setCurrentStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modal loading states
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

  // Role-based access control mapping for Kiosk
  const rolesByType = useMemo(() => ({
    'Kiosk': ['Kiosk_Admin', 'Kiosk_Shopkeeper']
  }), []);

  // Available roles for current business type
  const availableRoles = useMemo(() => {
    return rolesByType[currentBusiness?.type] || rolesByType['Kiosk'] || ['Kiosk_Admin', 'Kiosk_Shopkeeper'];
  }, [currentBusiness, rolesByType]);

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    setLoadingText("Loading staff data...");
    setErrorMessage(null);

    try {
      console.log('🔍 Starting staff fetch for business admin');
      console.log('📊 Current User:', currentUser);
      console.log('📊 Current Business:', currentBusiness);

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

      console.log('🔑 User Business ID:', userBusinessId);

      if (!userBusinessId) {
        throw new Error("No business assigned to your account. Please contact your administrator.");
      }

      let staffData = [];
      let businessInfo = null;

      try {
        console.log(`🔍 Fetching users for business: ${userBusinessId}`);
        const businessEndpoint = `/api/users/business/${userBusinessId}`;
        const result = await GET(businessEndpoint);

        console.log('📥 Business users endpoint response:', result);

        if (result?.success && Array.isArray(result.data)) {
          staffData = result.data;

          if (result.businessName) {
            businessInfo = {
              id: result.businessId || result.businessUUID || userBusinessId,
              name: result.businessName,
              type: result.businessType
            };
          }

          console.log('✅ Got users from business endpoint:', staffData.length);
        } else {
          console.log('⚠️ Business endpoint returned no data, trying fallback...');
        }
      } catch (businessError) {
        console.log('ℹ️ Business endpoint failed:', businessError.message);
      }

      if (staffData.length === 0) {
        console.log('🔄 Falling back to ALL users endpoint with filtering...');

        try {
          const allUsersEndpoint = URLS.USERS.GET_ALL_USERS || '/api/users';
          const allUsersResult = await GET(allUsersEndpoint);

          console.log('📥 All users endpoint response:', allUsersResult);

          if (allUsersResult?.success && Array.isArray(allUsersResult.data)) {
            console.log('📊 Total users in system:', allUsersResult.data.length);

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

              const hasValidRole = user.role && (
                user.role.startsWith(currentBusiness?.type + '_') ||
                availableRoles.includes(user.role)
              );

              const matches = belongsToCurrentBusiness && hasValidRole;

              if (matches) {
                console.log(`✅ User ${user.id} matches business ${userBusinessId}:`, {
                  userBusinessNumericId,
                  userBusinessUUID,
                  userAssociatedBusinessId,
                  userInstitutionId,
                  role: user.role
                });
              }

              return matches;
            });

            console.log('✅ Filtered users for current business:', staffData.length);
          }
        } catch (allUsersError) {
          console.error('❌ Failed to fetch all users:', allUsersError);
          throw new Error("Cannot connect to server. Please check your connection.");
        }
      }

      if (staffData.length === 0) {
        console.warn('⚠️ No users found for business:', userBusinessId);
        setStaff([]);
        setLoadedText("No staff members found for your business");
        showToaster("No Staff Found", "You can add new staff using the 'Add Staff' button.", "info");
        return;
      }

      const transformedStaff = staffData.map(member => {
        const memberBusinessId = member.businessId || member.associatedBusinessId || userBusinessId;
        const memberBusinessName = member.businessName || currentBusiness?.name || "Current Business";
        const memberBusinessType = member.businessType || currentBusiness?.type || "Kiosk";

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

      console.log('✅ Successfully transformed staff:', transformedStaff.length);
      console.log('📊 Sample staff member:', transformedStaff[0]);

      setStaff(transformedStaff);
      setLoadedText(`Loaded ${transformedStaff.length} staff member(s)`);
      showToaster("Success", `Successfully loaded ${transformedStaff.length} staff member(s)`, "success");

    } catch (error) {
      console.error('❌ Error fetching staff data:', error);
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

  const filterRoles = useMemo(() => [
    { value: "", label: "All Roles" },
    ...availableRoles.map(role => ({
      value: role,
      label: role.replace('_', ' ')
    }))
  ], [availableRoles]);

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staff)) return [];

    return staff.filter((member) => {
      if (!member) return false;

      const memberBusinessId = String(member.businessId || "").trim();
      const currentBusinessId = String(currentBusiness?.id || "").trim();

      if (!currentBusinessId || memberBusinessId !== currentBusinessId) {
        return false;
      }

      if (!availableRoles.includes(member.role)) {
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

      const matchesStatus = !filters.status ||
        (filters.status === 'ACTIVE' && member.status === 'ACTIVE') ||
        (filters.status === 'INACTIVE' && member.status === 'INACTIVE');

      const matchesRole = !filters.role || member.role === filters.role;

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

  const openFormModalWithLoader = async (modalType, staffMember = null) => {
    setFormModalLoading(true);

    switch (modalType) {
      case 'create':
        setFormLoadingText('Loading create form...');
        break;
      case 'edit':
        setFormLoadingText('Loading edit form...');
        // Log the complete staff member data for debugging
        console.log('📝 Editing staff member with data:', staffMember);
        break;
      case 'view':
        setFormLoadingText('Loading staff details...');
        break;
      default:
        setFormLoadingText('Loading...');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // If editing, ensure we have all fields populated
    if (modalType === 'edit' && staffMember) {
      // Transform the data to match form expectations
      const transformedStaff = {
        ...staffMember,
        // Ensure all required fields are present
        phone: staffMember.phone || staffMember.phoneNumber || "",
        phoneNumber: staffMember.phoneNumber || staffMember.phone || "",
        firstName: staffMember.firstName || "",
        lastName: staffMember.lastName || "",
        email: staffMember.email || "",
        username: staffMember.username || "",
        role: staffMember.role || availableRoles[0],
        status: staffMember.status || "ACTIVE",
        businessId: staffMember.businessId || staffMember.associatedBusinessId || currentBusiness?.id,
        businessName: staffMember.businessName || currentBusiness?.name,
        businessType: staffMember.businessType || currentBusiness?.type,
        // Include any additional fields from the API
        institutionId: staffMember.institutionId,
        lastLogin: staffMember.lastLogin,
        createdAt: staffMember.createdAt,
      };

      setCurrentStaff(transformedStaff);
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

  const openCreateModal = () => openFormModalWithLoader('create');

  const openEditModal = (staffMember) => {
    // Ensure we're passing all fields from the staffMember
    const completeStaffData = {
      ...staffMember,
      // Map phone to phoneNumber if needed by the form
      phoneNumber: staffMember.phone || staffMember.phoneNumber,
      // Ensure status is properly formatted
      status: staffMember.status || "ACTIVE",
      // Include all other fields from the user object
      email: staffMember.email || "",
      firstName: staffMember.firstName || "",
      lastName: staffMember.lastName || "",
      username: staffMember.username || "",
      role: staffMember.role || "",
      businessId: staffMember.businessId || staffMember.associatedBusinessId || currentBusiness?.id,
      businessName: staffMember.businessName || currentBusiness?.name,
      businessType: staffMember.businessType || currentBusiness?.type,
    };

    openFormModalWithLoader('edit', completeStaffData);
  };

  const openViewModal = (staffMember) => openFormModalWithLoader('view', staffMember);
  const openEnableModal = (staffMember) => openActionModalWithLoader('enable', staffMember);
  const openDisableModal = (staffMember) => openActionModalWithLoader('disable', staffMember);
  const openDeleteModal = (staffMember) => openActionModalWithLoader('delete', staffMember);

  const businessForForm = useMemo(() => {
    if (!currentBusiness) return [];

    return [{
      id: currentBusiness.id,
      businessId: currentBusiness.id,
      _id: currentBusiness.id,
      businessName: currentBusiness.name,
      businessType: currentBusiness.type
    }];
  }, [currentBusiness]);

  // FIXED FORM SUBMISSION WITH SAFE PROPERTY ACCESS
  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    setCreateLoading(true);
    setCreateSuccess(false);
    setCreateLoadingText(isEditing ? "Updating staff member..." : "Creating staff member...");
    setErrorMessage(null);

    try {
      // Validate that required fields exist before processing
      if (!values) {
        throw new Error('Form values are missing');
      }

      console.log('📝 Form submission values:', values);
      console.log('📝 Current staff (for edit):', currentStaff);

      // Safe trim function that handles undefined/null values
      const safeTrim = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return String(value).trim();
      };

      // Extract and validate all form fields with safe defaults
      const firstName = safeTrim(values.firstName);
      const lastName = safeTrim(values.lastName);
      const email = safeTrim(values.email);
      const username = safeTrim(values.username);
      const phone = safeTrim(values.phone || values.phoneNumber);
      const role = values.role || '';
      const status = values.status || 'ACTIVE';
      const businessId = values.businessId || values.institutionId || '';

      // Validate required fields
      if (!firstName) throw new Error('First name is required');
      if (!lastName) throw new Error('Last name is required');
      if (!email) throw new Error('Email is required');
      if (!username) throw new Error('Username is required');
      if (!phone) throw new Error('Phone number is required');
      if (!role) throw new Error('Role is required');
      if (!businessId) throw new Error('Business is required');

      // CRITICAL VALIDATION: Ensure role is valid for Kiosk
      if (!availableRoles.includes(role)) {
        throw new Error(`Invalid role selected. Please choose from: ${availableRoles.join(', ')}`);
      }

      // CRITICAL VALIDATION: Ensure businessId matches current business
      const submittedBusinessId = String(businessId).trim();
      const currentBusinessId = String(currentBusiness.id || "").trim();

      if (submittedBusinessId !== currentBusinessId) {
        throw new Error("Invalid business selection. You can only create users for your current business.");
      }

      // Prepare API data with ALL fields
      const staffData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        phone: phone,
        phoneNumber: phone,
        role: role,
        status: status === "ACTIVE" ? "active" : "inactive",
        businessId: currentBusiness.id,
        associatedBusinessId: currentBusiness.id,
        institutionId: currentStaff?.institutionId || currentBusiness.id,
        businessName: currentBusiness.name,
        businessType: currentBusiness.type,
        updatedBy: currentUser?.id || "system",
        updatedAt: new Date().toISOString()
      };

      // Only include password for new users
      if (!isEditing) {
        staffData.password = 'Temporary123!';
      }

      console.log('📤 Sending staff data to API:', staffData);

      let result;
      const staffName = `${firstName} ${lastName}`;

      if (isEditing && currentStaff) {
        // Update existing staff - include ALL fields from currentStaff
        const endpoint = URLS.USERS.UPDATE_USER.replace(':id', currentStaff.id);
        console.log('🔄 Updating user at:', endpoint);
        result = await PUT(endpoint, staffData);

        console.log('📥 Update result:', result);

        if (result && result.success) {
          // Update local state with ALL fields
          setStaff((prevStaff) =>
            prevStaff.map((member) =>
              member.id === currentStaff.id
                ? {
                  ...member,
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  username: username,
                  phone: phone,
                  phoneNumber: phone,
                  role: role,
                  status: status,
                  businessId: currentBusiness.id,
                  associatedBusinessId: currentBusiness.id,
                  institutionId: currentStaff.institutionId || currentBusiness.id,
                  businessName: currentBusiness.name,
                  businessType: currentBusiness.type,
                  // Preserve other fields
                  lastLogin: member.lastLogin,
                  createdAt: member.createdAt,
                }
                : member
            )
          );

          // Show success message in loader
          setCreateSuccess(true);
          setCreateLoadingText(`✓ Success! ${staffName} has been updated successfully.`);
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Show toaster
          showToaster("Staff Updated", `${staffName} has been updated successfully`, "success");

          // Navigate back to table
          closeAllModals();
        } else {
          throw new Error(result?.message || "Failed to update staff member");
        }
      } else {
        // Create new staff
        setCreateLoadingText(`Creating ${staffName}...`);

        result = await POST(URLS.USERS.CREATE_USER, staffData);

        console.log('📥 Create result:', result);

        if (result && result.success && result.user) {
          const newStaff = {
            id: result.user.id || result.user._id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            phone: phone,
            phoneNumber: phone,
            role: role,
            status: status,
            businessId: currentBusiness.id,
            associatedBusinessId: currentBusiness.id,
            institutionId: currentBusiness.id,
            businessName: currentBusiness.name,
            businessType: currentBusiness.type,
            dateJoined: result.user.createdAt || new Date().toISOString(),
          };

          setStaff((prevStaff) => [newStaff, ...prevStaff]);

          // Show success message in loader
          setCreateSuccess(true);
          setCreateLoadingText(`✓ Success! ${staffName} has been added to your team.`);
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Show toaster
          showToaster("Staff Created", `${staffName} has been added to your team`, "success");

          // Navigate back to table
          closeAllModals();
        } else {
          throw new Error(result?.message || "Failed to create staff member");
        }
      }

    } catch (error) {
      console.error('❌ Error submitting staff form:', error);

      // Show error in loader for 3 seconds, then return to form
      const errorMsg = error.message || 'Failed to save staff member. Please try again.';
      setCreateSuccess(false);
      setCreateLoadingText(`✗ Error: ${errorMsg}`);
      setErrorMessage(errorMsg);

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Return to form so user can fix the error
      setCreateLoading(false);
      setSubmitting(false);

      // Show error toaster
      showToaster("Error", errorMsg, "error");
    }
  };

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
      console.error('❌ Error deleting staff:', error);
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
      console.error('❌ Error toggling staff status:', error);
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

  // Show content loader during create/update operations
  if (createLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
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
  }

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
                <li>• Ensure you're logged in as a Kiosk_Admin for {currentBusiness.name}</li>
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
            onEnable={() => handleEnableStaff(currentStaff?.id)}
            onReject={handleRejectStaff}
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
    <div className="min-h-screen bg-white p-8">
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

export default KioskStaffManagement;