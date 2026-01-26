import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useTheme } from '../../../../components/theme/ThemeContext';
import TextInput from '../../../../components/Input/TextInput';
import SelectInput from '../../../../components/input/SelectInput';
import AppFormButton from '../../../../components/buttons/AppFormButton';

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
      .email('Invalid email address')
      .required('Email is required')
      .max(100, 'Email cannot exceed 100 characters'),

    businessId: Yup.string()
      .required('Business is required'),

    institutionId: Yup.string()
      .optional(),

    role: Yup.string()
      .required('Role is required'),

    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  });

  const safeInitialData = initialFormData || {
    firstName: '',
    lastName: '',
    email: '',
    businessId: '',
    institutionId: '',
    role: '',
    username: '',
    phoneNumber: '',
    status: 'ACTIVE'
  };

  const formik = useFormik({
    initialValues: safeInitialData,
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      console.log('📤 Submitting form with values:', values);
      console.log('📋 Form errors:', formik.errors);
      console.log('✅ Form is valid:', formik.isValid);

      if (formik.isValid) {
        const formDataWithDefaults = {
          ...values,
          password: 'Temporary123!',
          confirmPassword: 'Temporary123!'
        };
        handleSubmit(formDataWithDefaults);
      } else {
        Object.keys(formik.values).forEach(key => {
          formik.setFieldTouched(key, true);
        });
      }
      setSubmitting(false);
    },
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
  });

  useEffect(() => {
  }, [formik.values, formik.errors, formik.isValid]);

  useEffect(() => {
    if (forceBusinessId && !formik.values.businessId) {
      formik.setFieldValue('businessId', forceBusinessId);
      formik.setFieldValue('institutionId', forceBusinessId);
      console.log('🔒 Business locked to:', forceBusinessId);
    }
  }, [forceBusinessId]);

  useEffect(() => {
    const firstName = formik.values.firstName?.trim() || '';
    const lastName = formik.values.lastName?.trim() || '';

    if (firstName && lastName && (!isEditing || !formik.values.username)) {
      const generatedUsername = `${firstName}${lastName}`.toLowerCase();
      if (generatedUsername !== formik.values.username) {
        formik.setFieldValue('username', generatedUsername);
        console.log('✨ Auto-generated username:', generatedUsername);
      }
    }
  }, [formik.values.firstName, formik.values.lastName, isEditing]);
  const extractBusinessData = (business) => {
    if (!business) return null;

    let businessData = null;

    if (business._doc) {
      businessData = {
        id: business._doc.id || business._doc._id?.toString(),
        name: business._doc.businessName,
        type: business._doc.businessType,
        status: business._doc.status
      };
    }
    else if (business.id || business._id || business.businessName) {
      businessData = {
        id: business.id || business._id?.toString(),
        name: business.businessName || business.name,
        type: business.businessType || business.type,
        status: business.status
      };
    }

    if (!businessData || !businessData.name) {
      console.warn('⚠️ Could not extract valid business data');
      return null;
    }

    return businessData;
  };

  const businessOptions = React.useMemo(() => {
    if (lockedBusiness && forceBusinessId && businesses.length > 0) {
      const forcedBusiness = businesses.find(b => {
        const businessData = extractBusinessData(b);
        return businessData?.id === forceBusinessId;
      });

      if (forcedBusiness) {
        const businessData = extractBusinessData(forcedBusiness);
        return [{
          value: businessData.id,
          label: businessData.name
        }];
      }
    }

    if (!businesses || businesses.length === 0) {
      return [];
    }

    const options = businesses
      .map(business => {
        const businessData = extractBusinessData(business);
        return businessData;
      })
      .filter(business => business && business.name && business.id)
      .map(business => ({
        value: business.id,
        label: business.name
      }));

    return options;
  }, [businesses, forceBusinessId, lockedBusiness]);

  const roleOptions = React.useMemo(() => {
    return availableRoles.map(role => ({
      value: role,
      label: role.replace('_', ' ')
    }));
  }, [availableRoles]);

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
    formik.setFieldTouched(name, true);
  };

  const handleInputChange = (event) => {
    formik.handleChange(event);
  };

  const handleInputBlur = (event) => {
    formik.handleBlur(event);
  };

  const shouldShowError = (fieldName) => {
    return formik.touched[fieldName] && !!formik.errors[fieldName];
  };

  const getErrorMessage = (fieldName) => {
    return shouldShowError(fieldName) ? formik.errors[fieldName] : '';
  };

  return (
    <div className="bg-white rounded-lg w-3/5 max-w-4xl mx-auto shadow-lg border border-gray-200 mb-8">
      <div
        className="flex items-center justify-between p-6 border-gray-200 bg-gray-50 rounded-t-lg"
        style={{ borderBottom: `1px solid ${theme.borderColor || '#e5e7eb'}` }}
      >
        <h3
          className="text-xl font-semibold"
          style={{ color: theme.textPrimary || '#1f2937' }}
        >
          {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
        </h3>
        <button
          onClick={() => setShowModal(false)}
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

      <form onSubmit={formik.handleSubmit} className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="firstName"
              label="First Name"
              placeholder="John"
              input={formik.values.firstName}
              handleInput={handleInputChange}
              handleBlur={handleInputBlur}
              name="firstName"
              required={true}
              disabled={submitting}
              error={shouldShowError('firstName')}
              errorMessage={getErrorMessage('firstName')}
            />

            <TextInput
              id="lastName"
              label="Last Name"
              placeholder="Doe"
              input={formik.values.lastName}
              handleInput={handleInputChange}
              handleBlur={handleInputBlur}
              name="lastName"
              required={true}
              disabled={submitting}
              error={shouldShowError('lastName')}
              errorMessage={getErrorMessage('lastName')}
            />
          </div>
          <TextInput
            id="email"
            label="Email Address"
            placeholder="user@example.com"
            input={formik.values.email}
            handleInput={handleInputChange}
            handleBlur={handleInputBlur}
            name="email"
            type="email"
            required={true}
            disabled={submitting}
            error={shouldShowError('email')}
            errorMessage={getErrorMessage('email')}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              id="businessId"
              name="businessId"
              label="Business"
              options={businessOptions}
              value={formik.values.businessId || formik.values.institutionId}
              onChange={handleSelectChange}
              onBlur={handleInputBlur}
              required={true}
              disabled={submitting || lockedBusiness || businessOptions.length === 0}
              error={shouldShowError('businessId')}
              errorMessage={getErrorMessage('businessId')}
              placeholder={
                lockedBusiness
                  ? businessOptions[0]?.label || "Current Business"
                  : businessOptions.length === 0
                    ? "No active businesses available"
                    : "Select a business"
              }
            />

            <SelectInput
              id="role"
              name="role"
              label="Role"
              options={roleOptions}
              value={formik.values.role}
              onChange={handleSelectChange}
              onBlur={handleInputBlur}
              required={true}
              disabled={submitting || roleOptions.length === 0}
              error={shouldShowError('role')}
              errorMessage={getErrorMessage('role')}
              placeholder={
                roleOptions.length === 0
                  ? "No roles available"
                  : "Select a role"
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="username"
              label="Username"
              placeholder="johndoe"
              input={formik.values.username}
              handleInput={handleInputChange}
              handleBlur={handleInputBlur}
              name="username"
              required={true}
              disabled={submitting}
              error={shouldShowError('username')}
              errorMessage={getErrorMessage('username')}
            />

            <TextInput
              id="phoneNumber"
              label="Phone Number"
              placeholder="+254712345678"
              input={formik.values.phoneNumber}
              handleInput={handleInputChange}
              handleBlur={handleInputBlur}
              name="phoneNumber"
              type="tel"
              required={true}
              disabled={submitting}
              error={shouldShowError('phoneNumber')}
              errorMessage={getErrorMessage('phoneNumber')}
            />
          </div>
        </div>
        <div
          className="flex gap-3 pt-6 border-t border-gray-200 mt-6"
          style={{ borderTopColor: theme.borderColor || '#e5e7eb' }}
        >
          <AppFormButton
            text="Cancel"
            color="invert"
            isLoading={false}
            validation={true}
            action={() => setShowModal(false)}
            type="button"
            disabled={submitting}
          />
          <AppFormButton
            text={submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Staff Member')}
            color={theme.primaryColor || '#2563eb'}
            isLoading={submitting}
            validation={formik.isValid && !submitting}
            action={formik.handleSubmit}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateStaffForm;