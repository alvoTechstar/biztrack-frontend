import React from 'react';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import TextBoxInput from '../input/TextBoxInput';
import AppFormButton from '../buttons/AppFormButton';
import "../../App.css";

const ActionModal = ({
  isOpen,
  onClose,
  title,
  businessName, // Keep for backward compatibility
  entityName, // This is what's actually being passed
  actionType,
  reason,
  setReason,
  onSubmit,
  submitting = false,
  customDescription // Add this prop for custom descriptions
}) => {
  if (!isOpen) return null;

  // Use entityName if provided, otherwise fall back to businessName
  const displayName = entityName || businessName;

  const getActionConfig = () => {
    switch (actionType) {
      case 'disable':
        return {
          title: 'Disable Business',
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to disable <span className="font-averta-bold text-gray-900">"{displayName}"</span>. By disabling, all the users for that business will no longer have access to the BizTrack application.
            </div>
          ),
          buttonText: 'Disable Business',
          buttonColor: '#ea580c', // orange-600
          loadingText: 'Disabling...'
        };
      case 'delete':
        return {
          title: 'Delete Business',
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to delete <span className="font-averta-bold text-gray-900">"{displayName}"</span>. By deleting, all the users for that business will no longer have access to the BizTrack application and all data will be permanently removed.
            </div>
          ),
          buttonText: 'Delete Business',
          buttonColor: '#dc2626', // red-600
          loadingText: 'Deleting...'
        };
      case 'enable':
        return {
          title: 'Enable Business', // Changed from 'Enable User'
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to enable <span className="font-averta-bold text-gray-900">"{displayName}"</span>. By enabling, all the users for that business will regain access to the BizTrack application.
            </div>
          ),
          buttonText: 'Enable Business', // Changed from 'Enable User'
          buttonColor: '#22c55e', // green-600 for enable
          loadingText: 'Enabling...'
        };
      default:
        return {
          title: 'Action',
          description: customDescription || (
            <div className="font-averta text-gray-700">
              You are about to perform an action on <span className="font-averta-bold text-gray-900">"{displayName}"</span>.
            </div>
          ),
          buttonText: 'Confirm',
          buttonColor: '#2563eb', // blue-600
          loadingText: 'Processing...'
        };
    }
  };

  const config = getActionConfig();

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit();
  };

  const isFormValid = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-auto shadow-lg border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="text-xl font-semibold text-gray-900">
            {title || config.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={submitting}
            type="button"
          >
            <CancelRoundedIcon
              className="main-form-close"
              style={{
                fill: config.buttonColor,
                fontSize: '24px'
              }}
            />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="text-gray-700 text-base">
            {config.description}
          </div>

          {/* Show reason field for all actions */}
          <TextBoxInput
            id="reason"
            label="Reason"
            placeholder="Enter the reason for this action..."
            input={reason}
            handleInput={handleReasonChange}
            required={true}
            disabled={submitting}
            error={false}
            max={500}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-center p-6 border-t border-gray-200">
          <div className="w-full max-w-xs">
            <AppFormButton
              text={submitting ? config.loadingText : config.buttonText}
              color={config.buttonColor}
              isLoading={submitting}
              validation={isFormValid && !submitting}
              action={handleSubmit}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;