import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useTheme } from '../../../../components/theme/ThemeContext';
import TextInput from '../../../../components/Input/TextInput';
import SelectInput from '../../../../components/Input/SelectInput';
import AppFormButton from '../../../../components/buttons/AppFormButton';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),

  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),

  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters'),

  businessId: Yup.string()
    .required('Business is required'),

  role: Yup.string()
    .required('Role is required'),

  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(
      /^\+?[\d\s\-().]{6,20}$/,
      'Enter a valid phone number (e.g. 0712345678 or +254712345678)'
    ),
});

const CreateStaffForm = ({
  showModal,
  setShowModal,
  initialFormData,
  handleSubmit,
  businesses = [],
  rolesByType,
  isEditing,
  submitting = false,
  forceBusinessId = null,
  lockedBusiness = false,
  availableRoles = []
}) => {
  const theme = useTheme();

  if (!showModal) return null;

  // Always provide all defaults, then spread initialFormData on top.
  // forceBusinessId wins last so locked business is always set.
  const safeInitialData = {
    firstName: '',
    lastName: '',
    email: '',
    businessId: forceBusinessId || '',
    institutionId: forceBusinessId || '',
    role: '',
    username: '',
    phoneNumber: '',
    status: 'ACTIVE',
    ...(initialFormData || {}),
    ...(forceBusinessId
      ? { businessId: forceBusinessId, institutionId: forceBusinessId }
      : {}),
  };

  const formik = useFormik({
    initialValues: safeInitialData,
    validationSchema,
    onSubmit: (values) => {
      handleSubmit({
        ...values,
        password: 'Temporary123!',
        confirmPassword: 'Temporary123!',
      });
    },
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
  });

  // Auto-generate username from first + last name (create mode only)
  useEffect(() => {
    if (isEditing) return;
    const first = formik.values.firstName?.trim() || '';
    const last  = formik.values.lastName?.trim()  || '';
    if (!first || !last) return;
    const generated = `${first}${last}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (generated !== formik.values.username) {
      formik.setFieldValue('username', generated);
    }
  }, [formik.values.firstName, formik.values.lastName, isEditing]);

  // ── Business options ─────────────────────────────────────────
  const extractBusinessData = (business) => {
    if (!business) return null;
    const src = business._doc || business;
    const id   = src.id || src._id?.toString();
    const name = src.businessName || src.name;
    const type = src.businessType || src.type;
    if (!id || !name) return null;
    return { id, name, type, status: src.status };
  };

  const businessOptions = React.useMemo(() => {
    if (lockedBusiness && forceBusinessId && businesses.length > 0) {
      const match = businesses.find(b => extractBusinessData(b)?.id === forceBusinessId);
      if (match) {
        const d = extractBusinessData(match);
        return [{ value: d.id, label: d.name }];
      }
    }
    return businesses
      .map(extractBusinessData)
      .filter(Boolean)
      .map(d => ({ value: d.id, label: d.name }));
  }, [businesses, forceBusinessId, lockedBusiness]);

  const roleOptions = React.useMemo(() =>
    availableRoles.map(role => ({
      value: role,
      label: role.replace(/_/g, ' '),
    }))
  , [availableRoles]);

  // ── Helpers ──────────────────────────────────────────────────
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    // Pass shouldValidate=true so validation runs after the value is committed,
    // not before (which happened when calling setFieldTouched separately).
    formik.setFieldValue(name, value, true);
    formik.setFieldTouched(name, true, false);
  };

  const shouldShowError = (field) => formik.touched[field] && !!formik.errors[field];
  const getError       = (field) => shouldShowError(field) ? formik.errors[field] : '';

  const canSubmit = formik.isValid && formik.dirty && !submitting;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-lg w-full max-w-4xl mx-auto shadow-lg border border-gray-200 mb-8">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-t-lg"
        style={{ borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}` }}
      >
        <h3 className="text-lg sm:text-xl font-semibold" style={{ color: theme.textPrimary || '#1f2937' }}>
          {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
        </h3>
        <button
          onClick={() => setShowModal(false)}
          className="hover:bg-gray-100 transition rounded-full p-1"
          disabled={submitting}
          type="button"
        >
          <CancelRoundedIcon style={{ fill: theme.textSecondary || '#6b7280', fontSize: '24px' }} />
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="p-4 sm:p-6">
        <div className="space-y-6">

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              id="firstName" name="firstName" label="First Name" placeholder="John"
              input={formik.values.firstName}
              handleInput={formik.handleChange}
              handleBlur={formik.handleBlur}
              required disabled={submitting}
              error={shouldShowError('firstName')} errorMessage={getError('firstName')}
            />
            <TextInput
              id="lastName" name="lastName" label="Last Name" placeholder="Doe"
              input={formik.values.lastName}
              handleInput={formik.handleChange}
              handleBlur={formik.handleBlur}
              required disabled={submitting}
              error={shouldShowError('lastName')} errorMessage={getError('lastName')}
            />
          </div>

          {/* Email */}
          <TextInput
            id="email" name="email" label="Email Address" placeholder="user@example.com"
            type="email"
            input={formik.values.email}
            handleInput={formik.handleChange}
            handleBlur={formik.handleBlur}
            required disabled={submitting}
            error={shouldShowError('email')} errorMessage={getError('email')}
          />

          {/* Business + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              id="businessId" name="businessId" label="Business"
              options={businessOptions}
              value={formik.values.businessId || formik.values.institutionId || ''}
              onChange={handleSelectChange}
              onBlur={formik.handleBlur}
              required
              disabled={submitting || lockedBusiness || businessOptions.length === 0}
              error={shouldShowError('businessId')} errorMessage={getError('businessId')}
              placeholder={
                lockedBusiness
                  ? businessOptions[0]?.label || 'Current Business'
                  : businessOptions.length === 0
                    ? 'No active businesses available'
                    : 'Select a business'
              }
            />
            <SelectInput
              id="role" name="role" label="Role"
              options={roleOptions}
              value={formik.values.role || ''}
              onChange={handleSelectChange}
              onBlur={formik.handleBlur}
              required
              disabled={submitting || roleOptions.length === 0}
              error={shouldShowError('role')} errorMessage={getError('role')}
              placeholder={roleOptions.length === 0 ? 'No roles available' : 'Select a role'}
            />
          </div>

          {/* Username + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              id="username" name="username" label="Username" placeholder="johndoe"
              input={formik.values.username}
              handleInput={formik.handleChange}
              handleBlur={formik.handleBlur}
              required disabled={submitting}
              error={shouldShowError('username')} errorMessage={getError('username')}
            />
            <TextInput
              id="phoneNumber" name="phoneNumber" label="Phone Number"
              placeholder="0712345678 or +254712345678"
              type="tel"
              input={formik.values.phoneNumber}
              handleInput={formik.handleChange}
              handleBlur={formik.handleBlur}
              required disabled={submitting}
              error={shouldShowError('phoneNumber')} errorMessage={getError('phoneNumber')}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 mt-6"
          style={{ borderTopColor: theme.borderColor || '#e5e7eb' }}
        >
          <AppFormButton
            text="Cancel"
            color="invert"
            isLoading={false}
            validation={true}
            action={() => setShowModal(false)}
            disabled={submitting}
          />
          <AppFormButton
            text={submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Staff Member')}
            color={theme.primaryColor || '#2563eb'}
            isLoading={submitting}
            validation={canSubmit}
            action={formik.handleSubmit}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateStaffForm;
