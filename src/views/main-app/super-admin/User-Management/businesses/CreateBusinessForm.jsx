import React, { useState } from 'react';
import { useFormik } from 'formik';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Building2, CreditCard, Smartphone, Receipt, Settings as SettingsIcon, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import TextInput from '../../../../../components/Input/TextInput';
import SelectInput from '../../../../../components/Input/SelectInput';
import FileInput from '../../../../../components/Input/FileInput';
import TextBoxInput from '../../../../../components/Input/TextBoxInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import ColorInput from '../../../../../components/Input/ColorInput';
import { businessValidationSchema } from '../../../../../utilities/validationSchemas';

const PAYMENT_TYPES = [
    { value: 'TILL', label: 'Till Number', icon: CreditCard },
    { value: 'PAYBILL', label: 'Paybill Number', icon: Receipt },
    { value: 'POCHI', label: 'Pochi La Biashara', icon: Smartphone }
];

const CreateBusinessForm = ({
    showModal,
    setShowModal,
    initialFormData,
    handleSubmit,
    businessTypes,
    isEditing,
    currentLogoUrl,
    submitting,
    errorMessage
}) => {
    const theme = useTheme();
    const [paymentType, setPaymentType] = useState(initialFormData?.paymentType || 'TILL');

    if (!showModal) return null;

    const safeInitialData = {
        businessName: '',
        registrationNumber: '',
        address: '',
        businessType: '',
        email: '',
        phone: '',
        website: '',
        description: '',
        primaryColor: theme.primaryColor || '#1976d2',
        status: 'ACTIVE',
        logoFile: null,
        logoUrl: null,
        id: null,
        owner: '',
        paymentType: 'TILL',
        tillNumber: '',
        paybillNumber: '',
        accountNumber: '',
        pochiNumber: '',
        ...initialFormData
    };

    const formik = useFormik({
        initialValues: safeInitialData,
        validationSchema: businessValidationSchema,
        onSubmit: (values) => {
            // Clean up payment fields based on payment type
            const cleanedValues = { ...values };

            switch (values.paymentType) {
                case 'TILL':
                    cleanedValues.paybillNumber = '';
                    cleanedValues.accountNumber = '';
                    cleanedValues.pochiNumber = '';
                    break;
                case 'PAYBILL':
                    cleanedValues.tillNumber = '';
                    cleanedValues.pochiNumber = '';
                    break;
                case 'POCHI':
                    cleanedValues.tillNumber = '';
                    cleanedValues.paybillNumber = '';
                    cleanedValues.accountNumber = '';
                    break;
                default:
                    break;
            }

            handleSubmit(cleanedValues);
        },
        enableReinitialize: true,
        validateOnBlur: true,
        validateOnChange: true,
    });

    const handleFileDelete = () => {
        formik.setFieldValue('logoFile', null);
        formik.setFieldTouched('logoFile', false);
    };

    const businessTypeOptions = businessTypes.map(type => ({
        value: type,
        label: type
    }));

    const statusOptions = [
        { value: 'ACTIVE', label: 'ACTIVE' },
        { value: 'INACTIVE', label: 'INACTIVE' },
    ];

    const paymentTypeOptions = PAYMENT_TYPES.map(type => ({
        value: type.value,
        label: type.label,
        icon: type.icon
    }));

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        formik.setFieldValue(name, value);
        formik.setFieldTouched(name, true, false);

        // Update payment type state for conditional rendering
        if (name === 'paymentType') {
            setPaymentType(value);
        }
    };

    const handleSelectBlur = (event) => {
        const { name } = event.target;
        formik.setFieldTouched(name, true, true);
    };

    const handleInputChange = (event) => {
        formik.handleChange(event);
    };

    const handleInputBlur = (event) => {
        formik.handleBlur(event);
        formik.setFieldTouched(event.target.name, true, true);
    };

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        formik.setFieldValue('logoFile', file);
        formik.setFieldTouched('logoFile', true, true);
    };

    const shouldShowError = (fieldName) => {
        return formik.touched[fieldName] && !!formik.errors[fieldName];
    };

    const getErrorMessage = (fieldName) => {
        return shouldShowError(fieldName) ? formik.errors[fieldName] : '';
    };

    const getSubmitButtonText = () => {
        if (submitting) return 'Saving...';
        return isEditing ? 'Save Changes' : 'Add Business';
    };

    const renderPaymentFields = () => {
        switch (paymentType) {
            case 'TILL':
                return (
                    <div className="col-span-2">
                        <TextInput
                            id="tillNumber"
                            label="Till Number"
                            placeholder="e.g., 123456"
                            input={formik.values.tillNumber}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="tillNumber"
                            required={true}
                            disabled={submitting}
                            error={shouldShowError('tillNumber')}
                            errorMessage={getErrorMessage('tillNumber')}
                            helperText="Enter the business Till/Buy Goods number"
                        />
                    </div>
                );

            case 'PAYBILL':
                return (
                    <>
                        <div className="col-span-1">
                            <TextInput
                                id="paybillNumber"
                                label="Paybill Number"
                                placeholder="e.g., 123456"
                                input={formik.values.paybillNumber}
                                handleInput={handleInputChange}
                                handleBlur={handleInputBlur}
                                name="paybillNumber"
                                required={true}
                                disabled={submitting}
                                error={shouldShowError('paybillNumber')}
                                errorMessage={getErrorMessage('paybillNumber')}
                                helperText="Business Paybill number"
                            />
                        </div>
                        <div className="col-span-1">
                            <TextInput
                                id="accountNumber"
                                label="Account Number"
                                placeholder="e.g., ACC001 or Business Name"
                                input={formik.values.accountNumber}
                                handleInput={handleInputChange}
                                handleBlur={handleInputBlur}
                                name="accountNumber"
                                required={true}
                                disabled={submitting}
                                error={shouldShowError('accountNumber')}
                                errorMessage={getErrorMessage('accountNumber')}
                                helperText="Account number for the paybill"
                            />
                        </div>
                    </>
                );

            case 'POCHI':
                return (
                    <div className="col-span-2">
                        <TextInput
                            id="pochiNumber"
                            label="Pochi La Biashara Number"
                            placeholder="e.g., 254712345678"
                            input={formik.values.pochiNumber}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="pochiNumber"
                            required={true}
                            disabled={submitting}
                            error={shouldShowError('pochiNumber')}
                            errorMessage={getErrorMessage('pochiNumber')}
                            helperText="Enter the Pochi La Biashara phone number"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl w-full sm:w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 max-w-4xl mx-auto shadow-xl border border-gray-100 mb-8 my-4 sm:my-8 overflow-hidden">
            <div
                className="flex items-center justify-between p-4 sm:p-6"
                style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor || '#2563eb'}, ${theme.primaryColor || '#2563eb'}cc)`,
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">
                            {isEditing ? 'Edit Business' : 'Add New Business'}
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm">
                            {isEditing ? 'Update the business details below' : 'Fill in the details to onboard a new business'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(false)}
                    className="hover:bg-white/20 transition rounded-full p-1"
                    disabled={submitting}
                    type="button"
                    aria-label="Close modal"
                >
                    <CancelRoundedIcon
                        className="main-form-close"
                        style={{
                            fill: '#ffffff',
                            fontSize: '20px',
                            width: '20px',
                            height: '20px'
                        }}
                    />
                </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                )}
                <div className="space-y-4 sm:space-y-5">
                    {/* Business Information Section */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={16} style={{ color: theme.primaryColor || '#2563eb' }} />
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Business Information</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                    {/* Payment Configuration Section */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard size={16} style={{ color: theme.primaryColor || '#2563eb' }} />
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Payment Configuration</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectInput
                                id="paymentType"
                                name="paymentType"
                                label="Payment Type"
                                options={paymentTypeOptions}
                                value={formik.values.paymentType}
                                onChange={handleSelectChange}
                                onBlur={handleSelectBlur}
                                required={true}
                                disabled={submitting}
                                error={shouldShowError('paymentType')}
                                errorMessage={getErrorMessage('paymentType')}
                                helperText="Select the type of M-Pesa payment method"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {renderPaymentFields()}
                        </div>
                    </div>

                    {/* Business Settings Section */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <SettingsIcon size={16} style={{ color: theme.primaryColor || '#2563eb' }} />
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Business Settings</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                            {isEditing && (
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
                            )}
                        </div>
                    </div>

                    {/* Business Media Section */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <ImageIcon size={16} style={{ color: theme.primaryColor || '#2563eb' }} />
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Business Media</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                </div>

                <div
                    className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6"
                    style={{ borderTopColor: theme.borderColor || '#e5e7eb' }}
                >
                    <AppFormButton
                        text="Cancel"
                        color="invert"
                        isLoading={false}
                        validation={true}
                        action={() => setShowModal(false)}
                        type="button"
                        fullWidthOnMobile={true}
                    />
                    <AppFormButton
                        text={getSubmitButtonText()}
                        color={theme.primaryColor || '#2563eb'}
                        isLoading={submitting}
                        validation={formik.isValid && formik.dirty && !submitting}
                        action={formik.handleSubmit}
                        type="submit"
                        fullWidthOnMobile={true}
                    />
                </div>
            </form>
        </div>
    );
};

export default CreateBusinessForm;