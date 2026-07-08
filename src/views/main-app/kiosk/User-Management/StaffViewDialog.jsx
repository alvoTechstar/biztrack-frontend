import React from 'react';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useTheme } from '../../../../components/theme/ThemeContext';
import TextInput from '../../../../components/Input/TextInput';
import AppFormButton from '../../../../components/buttons/AppFormButton';

const StaffViewDialog = ({
  show,
  staff,           // fixed: was "user"
  onClose,
  onEnable,
  onDisable,
  onReject,        // kept for backward compat (acts as secondary close/back)
  submitting = false,
  currentBusiness,
}) => {
  const theme = useTheme();

  if (!show) return null;

  if (!staff) {
    return (
      <div className="bg-white rounded-lg w-3/5 max-w-4xl mx-auto shadow-lg border border-gray-200 mb-8">
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No Staff Data</h3>
          <p className="text-gray-600 mb-4">Staff information is not available.</p>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isActive = (staff.status || '').toUpperCase() === 'ACTIVE';

  const data = {
    firstName:       staff.firstName   || 'N/A',
    lastName:        staff.lastName    || 'N/A',
    email:           staff.email       || 'N/A',
    username:        staff.username    || 'N/A',
    role:            staff.role        || 'N/A',
    phoneNumber:     staff.phoneNumber || staff.phone || 'N/A',
    status:          staff.status      || 'N/A',
    businessName:    staff.businessName || currentBusiness?.name || 'N/A',
    lastLogin:       staff.lastLogin   || 'Never logged in',
  };

  return (
    <div className="bg-white rounded-lg w-3/5 max-w-4xl mx-auto shadow-lg border border-gray-200 mb-8">
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 bg-gray-50 rounded-t-lg"
        style={{ borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}` }}
      >
        <h3 className="text-xl font-semibold" style={{ color: theme.textPrimary || '#1f2937' }}>
          Staff Details — {data.firstName} {data.lastName}
        </h3>
        <button
          onClick={onClose}
          type="button"
          disabled={submitting}
          className="hover:bg-gray-100 transition rounded-full p-1"
        >
          <CancelRoundedIcon style={{ fill: theme.textSecondary || '#6b7280', fontSize: '24px' }} />
        </button>
      </div>

      <div className="p-6">
        {/* Status badge */}
        <div className="mb-5">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
          }`}>
            {isActive ? '● Active' : '● Inactive'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput id="view-firstName" label="First Name" input={data.firstName} name="firstName" disabled />
            <TextInput id="view-lastName"  label="Last Name"  input={data.lastName}  name="lastName"  disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput id="view-email"    label="Email Address" input={data.email}    name="email"    type="email" disabled />
            <TextInput id="view-username" label="Username"      input={data.username} name="username"              disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput id="view-business" label="Business"     input={data.businessName} name="businessName" disabled />
            <TextInput id="view-role"     label="Role"         input={data.role}         name="role"         disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput id="view-phone"     label="Phone Number" input={data.phoneNumber} name="phoneNumber" type="tel" disabled />
            <TextInput id="view-lastLogin" label="Last Login"   input={data.lastLogin}   name="lastLogin"             disabled />
          </div>
        </div>

        {/* Action buttons — status aware */}
        <div
          className="flex gap-3 pt-6 border-t border-gray-200 mt-6"
          style={{ borderTopColor: theme.borderColor || '#e5e7eb' }}
        >
          <AppFormButton
            text="Close"
            color="invert"
            isLoading={false}
            validation={true}
            action={onClose}
            disabled={submitting}
          />

          {isActive ? (
            <AppFormButton
              text={submitting ? 'Disabling...' : 'Disable Staff'}
              color={theme.colors?.error || '#dc2626'}
              isLoading={submitting}
              validation={!submitting}
              action={onDisable || onReject}
            />
          ) : (
            <AppFormButton
              text={submitting ? 'Enabling...' : 'Enable Staff'}
              color={theme.colors?.success || '#22c55e'}
              isLoading={submitting}
              validation={!submitting}
              action={onEnable}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffViewDialog;
