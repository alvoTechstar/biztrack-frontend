import React from 'react';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import TextBoxInput from '../Input/TextBoxInput';
import AppFormButton from '../buttons/AppFormButton';
import "../../App.css";

const ActionModal = ({
  isOpen,
  onClose,
  entityName,
  businessName,     // backward compat
  entityType = 'business',
  actionType,
  reason,
  setReason,
  onSubmit,
  submitting = false,
  customDescription,
}) => {
  if (!isOpen) return null;

  const displayName = entityName || businessName;
  const isStaff     = entityType === 'staff';

  const getActionConfig = () => {
    switch (actionType) {
      case 'disable':
        return {
          title:       isStaff ? 'Disable Staff Member'  : 'Disable Business',
          buttonText:  isStaff ? 'Disable Staff Member'  : 'Disable Business',
          buttonColor: '#ea580c',
          loadingText: 'Disabling...',
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to disable{' '}
              <span className="font-averta-bold text-gray-900">"{displayName}"</span>.{' '}
              {isStaff
                ? 'This staff member will no longer have access to the system.'
                : 'All users for that business will no longer have access to BizTrack.'}
            </div>
          ),
        };

      case 'enable':
        return {
          title:       isStaff ? 'Enable Staff Member'  : 'Enable Business',
          buttonText:  isStaff ? 'Enable Staff Member'  : 'Enable Business',
          buttonColor: '#22c55e',
          loadingText: 'Enabling...',
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to enable{' '}
              <span className="font-averta-bold text-gray-900">"{displayName}"</span>.{' '}
              {isStaff
                ? 'This will restore their access to the system.'
                : 'All users for that business will regain access to BizTrack.'}
            </div>
          ),
        };

      case 'delete':
        return {
          title:       isStaff ? 'Delete Staff Member'  : 'Delete Business',
          buttonText:  isStaff ? 'Delete Staff Member'  : 'Delete Business',
          buttonColor: '#dc2626',
          loadingText: 'Deleting...',
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to permanently delete{' '}
              <span className="font-averta-bold text-gray-900">"{displayName}"</span>.{' '}
              {isStaff
                ? 'This action cannot be undone.'
                : 'All data will be permanently removed.'}
            </div>
          ),
        };

      default:
        return {
          title:       'Confirm Action',
          buttonText:  'Confirm',
          buttonColor: '#2563eb',
          loadingText: 'Processing...',
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to perform an action on{' '}
              <span className="font-averta-bold text-gray-900">"{displayName}"</span>.
            </div>
          ),
        };
    }
  };

  const config = getActionConfig();
  const isFormValid = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="text-xl font-semibold text-gray-900">
            {config.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={submitting}
            type="button"
          >
            <CancelRoundedIcon style={{ fill: config.buttonColor, fontSize: '24px' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-gray-700 text-base">
            {config.description}
          </div>
          <TextBoxInput
            id="reason"
            label="Reason"
            placeholder="Enter the reason for this action..."
            input={reason}
            handleInput={(e) => setReason(e.target.value)}
            required
            disabled={submitting}
            error={false}
            max={500}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center p-6 border-t border-gray-200">
          <div className="w-full max-w-xs">
            <AppFormButton
              text={submitting ? config.loadingText : config.buttonText}
              color={config.buttonColor}
              isLoading={submitting}
              validation={isFormValid && !submitting}
              action={onSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
