// src/components/users/CreateUserForm.jsx
import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import TextInput from '../../../../../components/Input/TextInput';
import SelectInput from '../../../../../components/Input/SelectInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import { userValidationSchema } from '../../../../../utilities/validationSchemas';

const CreateUserForm = ({
  showModal,
  setShowModal,
  initialFormData,
  handleSubmit,
  businesses = [],
  rolesByType,
  isEditing,
  submitting = false
}) => {
  const theme = useTheme();

  if (!showModal) return null;

  const safeInitialData = initialFormData || {
    firstName: '',
    lastName: '',
    email: '',
    institutionId: '',
    role: '',
    username: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  };

  const formik = useFormik({
    initialValues: safeInitialData,
    validationSchema: userValidationSchema,
    onSubmit: (values) => {
      console.log('📤 Submitting form with values:', values);
      handleSubmit(values);
    },
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: false,
  });

  // Auto-generate username from firstName and lastName
  useEffect(() => {
    const firstName = formik.values.firstName?.trim() || '';
    const lastName = formik.values.lastName?.trim() || '';

    // Only auto-generate if not editing or if username is empty
    if (firstName && lastName && (!isEditing || !formik.values.username)) {
      const generatedUsername = `${firstName}${lastName}`.toLowerCase();
      formik.setFieldValue('username', generatedUsername);
      console.log('✨ Auto-generated username:', generatedUsername);
    }
  }, [formik.values.firstName, formik.values.lastName, isEditing]);

  // Extract business data from the complex MongoDB structure
  const extractBusinessData = (business) => {
    if (!business) {
      console.warn('⚠️ Null or undefined business received');
      return null;
    }

    let businessData = null;

    // Handle the nested _doc structure from MongoDB/Mongoose
    if (business._doc) {
      businessData = {
        id: business._doc.id || business._doc._id?.toString(),
        name: business._doc.businessName,
        type: business._doc.businessType,
        status: business._doc.status
      };
    }
    // If it's already a plain object with direct properties
    else if (business.id || business._id || business.businessName) {
      businessData = {
        id: business.id || business._id?.toString(),
        name: business.businessName || business.name,
        type: business.businessType || business.type,
        status: business.status
      };
    }

    // Validate extracted data
    if (!businessData || !businessData.name) {
      console.warn('⚠️ Could not extract valid business data from:', business);
      return null;
    }

    return businessData;
  };

  // Safely create business options - ONLY ACTIVE BUSINESSES
  const businessOptions = React.useMemo(() => {
    if (!businesses || businesses.length === 0) {
      console.log('❌ No businesses available');
      return [];
    }

    const options = businesses
      .map(business => {
        const businessData = extractBusinessData(business);
        if (!businessData) {
          return null;
        }
        return businessData;
      })
      .filter(business => {
        if (!business) return false;
        const status = business.status?.toLowerCase();
        const isActive = status === 'active';
        return isActive && business.name && business.id;
      })
      .map(business => ({
        value: business.id?.toString(),
        label: business.name
      }));

    console.log('✅ Business Options:', options);
    return options;
  }, [businesses]);

  // Get available roles based on selected business
  const getAvailableRoles = () => {
    if (!formik.values.institutionId || !businesses || businesses.length === 0) {
      return [];
    }

    const selectedBusiness = businesses.find(b => {
      const businessData = extractBusinessData(b);
      if (!businessData) return false;
      const businessId = businessData.id;
      const formBusinessId = formik.values.institutionId;
      return businessId === formBusinessId ||
        businessId?.toString() === formBusinessId?.toString();
    });

    if (!selectedBusiness) {
      return [];
    }

    const businessData = extractBusinessData(selectedBusiness);
    if (!businessData) return [];

    const businessType = businessData.type;
    const availableRoles = rolesByType?.[businessType] || [];
    return availableRoles;
  };

  const availableRoles = getAvailableRoles();
  const roleOptions = availableRoles.map(role => ({
    value: role,
    label: role
  }));

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);

    // Clear role when business changes
    if (name === 'institutionId') {
      formik.setFieldValue('role', '');
    }
  };

  const handleSelectBlur = (event) => {
    const { name } = event.target;
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

  const getSelectedBusinessType = () => {
    if (!formik.values.institutionId) return '';
    const selectedBusiness = businesses.find(b => {
      const businessData = extractBusinessData(b);
      if (!businessData) return false;
      const businessId = businessData.id;
      return businessId?.toString() === formik.values.institutionId;
    });
    if (!selectedBusiness) return '';
    const businessData = extractBusinessData(selectedBusiness);
    return businessData?.type || '';
  };

  const getSelectedBusinessName = () => {
    if (!formik.values.institutionId) return '';
    const selectedBusiness = businesses.find(b => {
      const businessData = extractBusinessData(b);
      if (!businessData) return false;
      const businessId = businessData.id;
      return businessId?.toString() === formik.values.institutionId;
    });
    if (!selectedBusiness) return '';
    const businessData = extractBusinessData(selectedBusiness);
    return businessData?.name || '';
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
          {isEditing ? 'Edit User' : 'Add New User'}
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
          {/* Name Fields */}
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

          {/* Email */}
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

          {/* Business and Role */}
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              id="institutionId"
              name="institutionId"
              label="Institution/Business"
              options={businessOptions}
              value={formik.values.institutionId}
              onChange={handleSelectChange}
              onBlur={handleSelectBlur}
              required={true}
              disabled={submitting || businessOptions.length === 0}
              error={shouldShowError('institutionId')}
              errorMessage={getErrorMessage('institutionId')}
              placeholder={businessOptions.length === 0 ? "No active businesses available" : "Select a business"}
            />

            <SelectInput
              id="role"
              name="role"
              label="Role"
              options={roleOptions}
              value={formik.values.role}
              onChange={handleSelectChange}
              onBlur={handleSelectBlur}
              required={true}
              disabled={submitting || !formik.values.institutionId || roleOptions.length === 0}
              error={shouldShowError('role')}
              errorMessage={getErrorMessage('role')}
              placeholder={
                !formik.values.institutionId
                  ? "Select a business first"
                  : roleOptions.length === 0
                    ? `No roles available for ${getSelectedBusinessType()} business`
                    : "Select a role"
              }
            />
          </div>

          {/* Username and Phone */}
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

        {/* Action Buttons */}
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
          />
          <AppFormButton
            text={submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add User')}
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

export default CreateUserForm;