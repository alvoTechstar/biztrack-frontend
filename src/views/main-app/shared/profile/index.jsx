import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import TextInput from "../../../../components/Input/TextInput";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "../../../../components/theme/ThemeContext";
import ChangePassword from "./ChangePassword";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import Toaster from "../../../../components/Toaster";

const MyProfile = ({ onClose }) => {
  const { primaryColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading profile...");
  const [loadedText, setLoadedText] = useState("");

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    businessName: "",
    businessType: "",
    phoneNumber: "",
    lastLogin: "",
    userId: ""
  });

  const [originalUserData, setOriginalUserData] = useState(null);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isOpeningChangePassword, setIsOpeningChangePassword] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
  });

  // Show notification helper
  const showNotification = (message, type = "success") => {
    let title = "";
    let stateValue = "";

    switch (type) {
      case "success":
        title = "Success!";
        stateValue = "true";
        break;
      case "error":
        title = "Error!";
        stateValue = "false";
        break;
      case "info":
        title = "Info";
        stateValue = "";
        break;
      default:
        title = "Notification";
        stateValue = "";
    }

    setNotification({ open: true, title, message, type: stateValue });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, open: false })),
      3000
    );
  };

  // Fetch user profile - SIMPLIFIED VERSION
  const fetchUserProfile = async () => {
    setLoading(true);
    setLoadingText("Loading your profile...");

    try {
      // Get user data from cookies directly (no API call for now)
      const storedRaw = Cookies.get("user");

      if (!storedRaw) {
        throw new Error("No user data found. Please log in again.");
      }

      const user = JSON.parse(storedRaw);
      console.log("User data loaded from cookies:", user);

      // Set user data
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        phoneNumber: user.phoneNumber || user.phone || "",
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : "Never",
        userId: user.id || ""
      });

      // Set original data for comparison
      setOriginalUserData(user);

      showNotification("Profile loaded successfully", "success");

    } catch (error) {
      console.error("Error loading user profile:", error);
      showNotification(error.message || "Failed to load profile", "error");

      // Set default data to prevent empty display
      setUserData({
        firstName: "User",
        lastName: "Name",
        email: "user@example.com",
        role: "User",
        businessName: "Business",
        businessType: "General",
        phoneNumber: "",
        lastLogin: "Never",
        userId: ""
      });

    } finally {
      // IMPORTANT: Always set loading to false after a short delay
      setTimeout(() => {
        setLoading(false);
        setLoadedText("Profile loaded");
      }, 500); // Small delay to show loading briefly
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges() || isLoadingSave) return;

    setIsLoadingSave(true);
    setIsUpdatingProfile(true);
    setLoadingText("Saving changes...");

    try {
      // For now, just simulate the save operation
      console.log("Saving profile changes:", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update original data to reflect saved state
      const updatedUser = {
        ...originalUserData,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
      };

      setOriginalUserData(updatedUser);

      // Update cookies
      Cookies.set("user", JSON.stringify(updatedUser), { expires: 1 });

      showNotification("Profile updated successfully!", "success");

    } catch (error) {
      console.error("Error saving changes:", error);
      showNotification("Failed to save changes. Please try again.", "error");

    } finally {
      setIsLoadingSave(false);
      setIsUpdatingProfile(false);
      setLoadingText("Loading profile...");
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    setLoadingText("Changing password...");
    setIsUpdatingProfile(true);

    try {
      // Simulate password change API call
      console.log("Changing password...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification("Password changed successfully!", "success");
      return true;

    } catch (error) {
      console.error("Error changing password:", error);
      showNotification("Failed to change password. Please try again.", "error");
      throw error;

    } finally {
      setIsUpdatingProfile(false);
      setLoadingText("Loading profile...");
    }
  };

  // Handle opening change password modal with loader
  const openChangePasswordModal = () => {
    setIsOpeningChangePassword(true);
    setLoadingText("Opening change password...");

    // Simulate a brief loading period
    setTimeout(() => {
      setIsChangePasswordOpen(true);
      setIsOpeningChangePassword(false);
    }, 300);
  };

  // Handle closing change password modal
  const handleCloseChangePassword = () => {
    setIsChangePasswordOpen(false);
    setIsUpdatingProfile(false);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalUserData || isLoadingSave) return false;

    const originalPhone = originalUserData.phoneNumber || originalUserData.phone || "";
    const currentPhone = userData.phoneNumber || "";

    return (
      userData.firstName.trim() !== (originalUserData.firstName || "").trim() ||
      userData.lastName.trim() !== (originalUserData.lastName || "").trim() ||
      currentPhone.trim() !== originalPhone.trim()
    );
  };

  // Format role for better display
  const formatRole = (role) => {
    if (!role) return "";
    return role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle input change with validation
  const handleInputChange = (field, value) => {
    // Basic validation
    if (field === 'firstName' || field === 'lastName') {
      // Only allow letters, spaces, and hyphens
      const isValid = /^[a-zA-Z\s-]*$/.test(value);
      if (!isValid && value !== "") return;

      // Limit length
      if (value.length > 50) return;
    }

    if (field === 'phoneNumber') {
      // Only allow numbers, plus, and spaces
      const isValid = /^[0-9+\s]*$/.test(value);
      if (!isValid && value !== "") return;

      // Limit length
      if (value.length > 15) return;
    }

    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // Loading state - Show ContentLoader when opening profile
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
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

  // Show overlay loader during operations
  const renderOverlayLoader = () => {
    if (isUpdatingProfile || isLoadingSave || isOpeningChangePassword) {
      return (
        <div className="min-h-screen bg-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className='main-app-view'>
              <div className="main-app-content-container">
                <ContentLoader
                  state={true}
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
    return null;
  };

  return (
    <>
      <div
        className="
          p-4 sm:p-6
          md:mx-auto md:max-w-3xl
          lg:max-w-3xl
          bg-white rounded-lg shadow-md mb-8
          relative min-h-[400px]
        "
      >
        {/* Overlay loader for all operations */}
        {renderOverlayLoader()}

        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={isLoadingSave || isUpdatingProfile || isOpeningChangePassword}
            sx={{
              size: "small",
              backgroundColor: primaryColor,
              color: "#fff",
              "&:hover": {
                backgroundColor: primaryColor,
                opacity: 0.9,
              },
              "&.Mui-disabled": {
                backgroundColor: "#e5e7eb",
                color: "#9ca3af",
                "&:hover": {
                  backgroundColor: "#e5e7eb", // Keep same color when disabled and hovered
                  opacity: 1,
                }
              },
              "& .MuiSvgIcon-root": {
                fontSize: "0.9rem",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          You can edit your first name, last name, and phone number.
          Use the Change Password button to update your password.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Editable Fields */}
          <TextInput
            id="firstName"
            label="First Name"
            input={userData.firstName}
            handleInput={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
            required={true}
            disabled={isLoadingSave || isUpdatingProfile || isOpeningChangePassword}
          />

          <TextInput
            id="lastName"
            label="Last Name"
            input={userData.lastName}
            handleInput={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
            required={true}
            disabled={isLoadingSave || isUpdatingProfile || isOpeningChangePassword}
          />

          {/* Non-editable Fields */}
          <TextInput
            id="email"
            label="Email Address"
            input={userData.email}
            disabled={true}
          />

          <TextInput
            id="role"
            label="Role"
            input={formatRole(userData.role)}
            disabled={true}
          />

          <TextInput
            id="businessName"
            label="Business Name"
            input={userData.businessName}
            disabled={true}
          />

          <TextInput
            id="businessType"
            label="Business Type"
            input={userData.businessType}
            disabled={true}
          />

          {/* Phone Number - Editable */}
          <TextInput
            id="phoneNumber"
            label="Phone Number"
            input={userData.phoneNumber}
            handleInput={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="e.g., 0712345678"
            disabled={isLoadingSave || isUpdatingProfile || isOpeningChangePassword}
          />

          <TextInput
            id="lastLogin"
            label="Last Login"
            input={userData.lastLogin}
            disabled={true}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="flex-1">
            <AppFormButton
              text="Change Password"
              color="invert"
              isLoading={false}
              validation={!isUpdatingProfile && !isOpeningChangePassword}
              action={openChangePasswordModal}
              disabled={isUpdatingProfile || isOpeningChangePassword}
            />
          </div>

          <div className="flex-1">
            <AppFormButton
              text={isLoadingSave ? "Saving..." : "Save Changes"}
              color={primaryColor || "#1f2937"}
              isLoading={isLoadingSave}
              validation={hasUnsavedChanges() && !isUpdatingProfile && !isOpeningChangePassword}
              action={handleSaveChanges}
              disabled={!hasUnsavedChanges() || isUpdatingProfile || isOpeningChangePassword}
            />
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePassword
        open={isChangePasswordOpen}
        onClose={handleCloseChangePassword}
        onPasswordChange={handlePasswordChange}
        isSubmitting={isUpdatingProfile}
        primaryColor={primaryColor}
      />

      {/* Notification Toaster */}
      <Toaster
        open={notification.open}
        state={notification.type}
        title={notification.title}
        message={notification.message}
        action={() => setNotification(prev => ({ ...prev, open: false }))}
        position="right"
      />
    </>
  );
};

export default MyProfile;