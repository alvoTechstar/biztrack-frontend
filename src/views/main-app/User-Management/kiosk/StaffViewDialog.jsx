// src/components/users/EnableUserView.jsx
import React from 'react';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useTheme } from '../../../../components/theme/ThemeContext';
import TextInput from '../../../../components/Input/TextInput';
import AppFormButton from '../../../../components/buttons/AppFormButton';

const StaffViewdialog = ({
  user,
  onClose,
  onEnable,
  onReject,
  submitting = false
}) => {
  const theme = useTheme();

  // Debug log to check what data we're receiving
  console.log('EnableUserView received user:', user);

  // If no user data, show a message
  if (!user) {
    return (
      <div className="bg-white rounded-lg w-3/5 max-w-4xl mx-auto shadow-lg border border-gray-200 mb-8">
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No User Data</h3>
          <p className="text-gray-600">User information is not available.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Map user data to form fields with fallbacks
  const userData = {
    firstName: user.firstName || 'N/A',
    lastName: user.lastName || 'N/A',
    email: user.email || 'N/A',
    institutionName: user.institutionName || 'N/A',
    role: user.role || 'N/A',
    username: user.username || 'N/A',
    phoneNumber: user.phoneNumber || 'N/A',
    status: user.status || 'N/A',
    lastLogin: user.lastLogin || 'Never'
  };

  return (
    <div className="bg-white rounded-lg w-3/5 max-w-4xl mx-auto shadow-lg border border-gray-200 mb-8">
      {/* Modal Header */}
      <div
        className="flex items-center justify-between p-6 border-gray-200 bg-gray-50 rounded-t-lg"
        style={{ borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}` }}
      >
        <h3
          className="text-xl font-semibold"
          style={{ color: theme.textPrimary || '#1f2937' }}
        >
          Review User - {userData.firstName} {userData.lastName}
        </h3>
        <button
          onClick={onClose}
          className="hover:bg-gray-100 transition rounded-full p-1"
          disabled={submitting}
          type="button"
        >
          <CancelRoundedIcon
            className="main-form-close"
            style={{
              fill: theme.textSecondary || '#6b7280',
              fontSize: '24px'
            }}
          />
        </button>
      </div>

      <div className="p-6">
        {/* User Information Section */}
        <div className="space-y-6">
          <h4
            className="font-semibold text-sm uppercase tracking-wide border-b pb-2"
            style={{ color: theme.textPrimary || '#374151' }}
          >
            User Information
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="firstName"
              label="First Name"
              input={userData.firstName}
              name="firstName"
              disabled={true}
            />

            <TextInput
              id="lastName"
              label="Last Name"
              input={userData.lastName}
              name="lastName"
              disabled={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="email"
              label="Email Address"
              input={userData.email}
              name="email"
              type="email"
              disabled={true}
            />

            <TextInput
              id="username"
              label="Username"
              input={userData.username}
              name="username"
              disabled={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="institutionName"
              label="Institution/Business"
              input={userData.institutionName}
              name="institutionName"
              disabled={true}
            />

            <TextInput
              id="role"
              label="Role"
              input={userData.role}
              name="role"
              disabled={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="phoneNumber"
              label="Phone Number"
              input={userData.phoneNumber}
              name="phoneNumber"
              type="tel"
              disabled={true}
            />

            <TextInput
              id="status"
              label="Status"
              input={userData.status}
              name="status"
              disabled={true}
            />
          </div>

          <TextInput
            id="lastLogin"
            label="Last Login"
            input={userData.lastLogin}
            name="lastLogin"
            disabled={true}
          />
        </div>

        {/* Action Buttons */}
        <div
          className="flex gap-3 pt-6 border-t border-gray-200 mt-6"
          style={{ borderTopColor: theme.borderColor || '#e5e7eb' }}
        >
          <AppFormButton
            text="Reject User"
            color={theme.colors.error || '#dc2626'}
            isLoading={submitting}
            validation={!submitting}
            action={onReject}
            type="button"
          />
          <AppFormButton
            text="Enable User"
            color={theme.colors.success || '#22c55e'}
            isLoading={submitting}
            validation={!submitting}
            action={onEnable}
            type="button"
          />
        </div>
      </div>
    </div>
  );
};

export default StaffViewdialog;