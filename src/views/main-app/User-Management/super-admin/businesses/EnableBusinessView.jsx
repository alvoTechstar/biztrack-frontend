import React from 'react';
import { useFormik } from 'formik';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Building2 } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import TextInput from '../../../../../components/Input/TextInput';
import SelectInput from '../../../../../components/input/SelectInput';
import FileInput from '../../../../../components/input/FileInput';
import TextBoxInput from '../../../../../components/input/TextBoxInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import ColorInput from '../../../../../components/input/ColorInput';
import { businessValidationSchema, businessRequiredFieldsSchema } from '../../../../../utilities/validationSchemas';

const CreateBusinessForm = ({
    showModal,
    setShowModal,
    initialFormData,
    handleSubmit,
    businessTypes,
    isEditing,
    currentLogoUrl,
    submitting
}) => {
    const theme = useTheme();

    if (!showModal) return null;
    const safeInitialData = initialFormData || {
        businessName: '',
        registrationNumber: '',
        address: '',
        businessType: '',
        email: '',
        phone: '',
        website: '',
        description: '',
        primaryColor: theme.primaryColor || '#1976d2',
        status: 'NEW',
        logoFile: null,
        logoUrl: null,
        id: null,
        owner: '',
    };

    const formik = useFormik({
        initialValues: safeInitialData,
        validationSchema: businessValidationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
        enableReinitialize: true,
        validateOnBlur: true,
        validateOnChange: false,
    });
    const areRequiredFieldsValid = () => {
        const requiredFields = ['businessName', 'registrationNumber', 'owner', 'businessType', 'address', 'email', 'phone'];
        const hasValues = requiredFields.every(field => {
            const value = formik.values[field];
            return value && value.toString().trim().length > 0;
        });
        if (!hasValues) return false;
        const hasNoErrors = requiredFields.every(field => !formik.errors[field]);
        return hasNoErrors;
    };

    const handleFileDelete = () => {
        formik.setFieldValue('logoFile', null);
        formik.setFieldTouched('logoFile', false);
    };

    const businessTypeOptions = businessTypes.map(type => ({
        value: type,
        label: type
    }));

    const statusOptions = [
        // { value: 'NEW', label: 'NEW' },
        { value: 'ACTIVE', label: 'ACTIVE' },
        { value: 'INACTIVE', label: 'INACTIVE' }
    ];

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        formik.setFieldValue(name, value);
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

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        formik.setFieldValue('logoFile', file);
        formik.setFieldTouched('logoFile', true);
    };
    const shouldShowError = (fieldName) => {
        return formik.touched[fieldName] && !!formik.errors[fieldName];
    };
    const getErrorMessage = (fieldName) => {
        return shouldShowError(fieldName) ? formik.errors[fieldName] : '';
    };
    const canSubmit = () => {
        return areRequiredFieldsValid() && !submitting;
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
                    {isEditing ? 'Edit Business' : 'Add New Business'}
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
                            id="businessName"
                            label="Business Name"
                            placeholder="e.g., Grand Hotel Plaza"
                            input={formik.values.businessName}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="businessName"
                            required={true}
                            disabled={submitting}
                            error={shouldShowError('businessName')}
                            errorMessage={getErrorMessage('businessName')}
                        />

                        <TextInput
                            id="registrationNumber"
                            label="Registration Number"
                            placeholder="e.g., BRN001234"
                            input={formik.values.registrationNumber}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="registrationNumber"
                            required={true}
                            disabled={isEditing || submitting}
                            error={shouldShowError('registrationNumber')}
                            errorMessage={getErrorMessage('registrationNumber')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            id="owner"
                            label="Owner Full Name"
                            placeholder="e.g., Jane Doe"
                            input={formik.values.owner}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="owner"
                            required={true}
                            disabled={submitting}
                            error={shouldShowError('owner')}
                            errorMessage={getErrorMessage('owner')}
                        />

                        <SelectInput
                            id="businessType"
                            name="businessType"
                            label="Business Type"
                            options={businessTypeOptions}
                            value={formik.values.businessType}
                            onChange={handleSelectChange}
                            onBlur={handleSelectBlur}
                            required={true}
                            disabled={submitting}
                            error={shouldShowError('businessType')}
                            errorMessage={getErrorMessage('businessType')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            id="address"
                            label="Address"
                            placeholder="Full business address"
                            input={formik.values.address}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="address"
                            required={true}
                            disabled={submitting}
                            error={shouldShowError('address')}
                            errorMessage={getErrorMessage('address')}
                        />

                        <TextInput
                            id="website"
                            label="Website"
                            placeholder="https://example.com"
                            input={formik.values.website || ''}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="website"
                            type="url"
                            disabled={submitting}
                            error={shouldShowError('website')}
                            errorMessage={getErrorMessage('website')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            id="email"
                            label="Email"
                            placeholder="business@example.com"
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

                        <TextInput
                            id="phone"
                            label="Phone Number"
                            placeholder="+1-234-567-8900"
                            input={formik.values.phone}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="phone"
                            type="tel"
                            required={true}
                            disabled={submitting}
                            error={shouldShowError('phone')}
                            errorMessage={getErrorMessage('phone')}
                        />
                    </div>
                </div>
                <div className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <ColorInput
                            id="primaryColor"
                            label="Primary Color"
                            input={formik.values.primaryColor}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            disabled={submitting}
                            error={shouldShowError('primaryColor')}
                            errorMessage={getErrorMessage('primaryColor')}
                        />

                        <SelectInput
                            id="status"
                            name="status"
                            label="Status"
                            options={statusOptions}
                            value={formik.values.status}
                            onChange={handleSelectChange}
                            onBlur={handleSelectBlur}
                            disabled={submitting}
                            error={shouldShowError('status')}
                            errorMessage={getErrorMessage('status')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FileInput
                            id="logoFile"
                            showImage={true}
                            disabled={submitting}
                            label="Business Logo"
                            formats=".png,.jpg,.jpeg"
                            input={formik.values.logoFile}
                            handleFile={handleFileInput}
                            handleDelete={handleFileDelete}
                            type="file"
                            required={false}
                            error={shouldShowError('logoFile')}
                            errorMessage={getErrorMessage('logoFile')}
                            currentImageUrl={currentLogoUrl}
                        />

                        <TextBoxInput
                            id="description"
                            label="Description"
                            placeholder="Business description..."
                            input={formik.values.description || ''}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="description"
                            disabled={submitting}
                            error={shouldShowError('description')}
                            errorMessage={getErrorMessage('description')}
                        />
                    </div>
                </div>
                <div
                    className="flex gap-3 pt-6 border-t border-gray-200"
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
                        text={submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Business')}
                        color={theme.primaryColor || '#2563eb'}
                        isLoading={submitting}
                        validation={canSubmit()}
                        action={formik.handleSubmit}
                        type="submit"
                    />
                </div>
            </form>
        </div>
    );
};

export default CreateBusinessForm;