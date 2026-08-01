import React from 'react';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Ban, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import TextBoxInput from '../Input/TextBoxInput';
import AppFormButton from '../buttons/AppFormButton';
import "../../App.css";

const ACTION_META = {
  disable: {
    buttonColor: '#ea580c',
    iconBg: '#fff7ed',
    icon: Ban,
    loadingText: 'Disabling...',
    title: (isStaff) => (isStaff ? 'Disable Staff Member' : 'Disable Business'),
    describe: (isStaff, displayName) => (
      <>
        You are about to disable{' '}
        <span className="font-averta-bold text-gray-900">"{displayName}"</span>.{' '}
        {isStaff
          ? 'This staff member will no longer have access to the system.'
          : 'All users for that business will no longer have access to BizTrack.'}
      </>
    ),
  },
  enable: {
    buttonColor: '#22c55e',
    iconBg: '#f0fdf4',
    icon: CheckCircle2,
    loadingText: 'Enabling...',
    title: (isStaff) => (isStaff ? 'Enable Staff Member' : 'Enable Business'),
    describe: (isStaff, displayName) => (
      <>
        You are about to enable{' '}
        <span className="font-averta-bold text-gray-900">"{displayName}"</span>.{' '}
        {isStaff
          ? 'This will restore their access to the system.'
          : 'All users for that business will regain access to BizTrack.'}
      </>
    ),
  },
  delete: {
    buttonColor: '#dc2626',
    iconBg: '#fef2f2',
    icon: Trash2,
    loadingText: 'Deleting...',
    title: (isStaff) => (isStaff ? 'Delete Staff Member' : 'Delete Business'),
    describe: (isStaff, displayName) => (
      <>
        You are about to permanently delete{' '}
        <span className="font-averta-bold text-gray-900">"{displayName}"</span>.{' '}
        {isStaff
          ? 'This action cannot be undone.'
          : 'All data will be permanently removed.'}
      </>
    ),
  },
  default: {
    buttonColor: '#2563eb',
    iconBg: '#eff6ff',
    icon: AlertTriangle,
    loadingText: 'Processing...',
    title: () => 'Confirm Action',
    describe: (isStaff, displayName) => (
      <>
        You are about to perform an action on{' '}
        <span className="font-averta-bold text-gray-900">"{displayName}"</span>.
      </>
    ),
  },
};

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
  const meta = ACTION_META[actionType] || ACTION_META.default;

  const config = {
    title: meta.title(isStaff),
    buttonText: meta.title(isStaff),
    buttonColor: meta.buttonColor,
    iconBg: meta.iconBg,
    icon: meta.icon,
    loadingText: meta.loadingText,
    description: customDescription || (
      <div className="font-averta text-gray-700">
        {meta.describe(isStaff, displayName)}
      </div>
    ),
  };
  const isFormValid = reason.trim().length > 0;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: config.iconBg }}
            >
              <Icon size={20} style={{ color: config.buttonColor }} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 leading-tight pt-1.5">
              {config.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            disabled={submitting}
            type="button"
            aria-label="Close modal"
          >
            <CancelRoundedIcon style={{ fontSize: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="text-gray-600 text-sm leading-relaxed">
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
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <AppFormButton
            text="Cancel"
            color="invert"
            isLoading={false}
            validation={!submitting}
            action={onClose}
          />
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
  );
};

export default ActionModal;
