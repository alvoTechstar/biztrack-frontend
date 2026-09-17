import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import {
    ArrowLeft,
    Building2,
    CreditCard,
    Smartphone,
    Receipt,
    Settings as SettingsIcon,
    Image as ImageIcon,
} from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import TextInput from '../../../../../components/Input/TextInput';
import SelectInput from '../../../../../components/Input/SelectInput';
import FileInput from '../../../../../components/Input/FileInput';
import TextBoxInput from '../../../../../components/Input/TextBoxInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import ColorInput from '../../../../../components/Input/ColorInput';
import ContentLoader from '../../../../../components/Loader/ContentLoader';
import Toaster from '../../../../../components/Toaster';
import { businessValidationSchema } from '../../../../../utilities/validationSchemas';
import { GET, POST, PUT } from '../../../../../services/DatabaseServiceImp';
import URLS from '../../../../../utilities/Endpoints';
import { isFailureResponse, getResponseErrorMessage } from '../../../../../utilities/apiResponse';

const businessTypes = ['Hotel', 'Kiosk', 'Hospital'];

const PAYMENT_TYPES = [
    { value: 'TILL', label: 'Till Number', icon: CreditCard },
    { value: 'PAYBILL', label: 'Paybill Number', icon: Receipt },
    { value: 'POCHI', label: 'Pochi La Biashara', icon: Smartphone },
];

const blankFormData = (primaryColor) => ({
    businessName: '',
    registrationNumber: '',
    address: '',
    businessType: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    primaryColor: primaryColor || '#1976d2',
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
});

const SectionCard = ({ icon: Icon, title, accentColor, children }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
                <Icon size={16} />
            </div>
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h4>
        </div>
        {children}
    </div>
);

const CreateBusinessPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const accentColor = theme.primaryColor || '#2563eb';

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [paymentType, setPaymentType] = useState('TILL');
    const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
    const [initialValues, setInitialValues] = useState(blankFormData(theme.primaryColor));
    const [toaster, setToaster] = useState({ open: false, state: 'true', title: '', message: '' });

    const showToaster = (state, title, message) => {
        setToaster({ open: true, state: state ? 'true' : 'false', title, message });
    };

    useEffect(() => {
        if (!isEditing) return;

        const fetchBusiness = async () => {
            setLoading(true);
            try {
                const url = URLS.BUSINESS.GET_BUSINESS_BY_ID.replace(':id', id);
                const result = await GET(url);
                const raw = result?.data || result?.business || result;
                const businessObj = raw?._doc || raw;

                if (!businessObj || (!businessObj.businessName && !businessObj.name)) {
                    throw new Error('Business not found');
                }

                const paymentConfig = businessObj.paymentConfig || {};
                const mapped = {
                    id: businessObj.id || businessObj._id?.toString() || id,
                    businessName: businessObj.businessName || businessObj.name || '',
                    registrationNumber: businessObj.registrationNumber || '',
                    address: businessObj.address || '',
                    businessType: businessObj.businessType || businessObj.type || '',
                    email: businessObj.email || '',
                    phone: businessObj.phone || '',
                    website: businessObj.website || '',
                    description: businessObj.description || '',
                    primaryColor: businessObj.primaryColor || accentColor,
                    status: (businessObj.status || 'ACTIVE').toUpperCase(),
                    logoFile: null,
                    logoUrl: businessObj.logoUrl || businessObj.logo || null,
                    owner: businessObj.owner || '',
                    paymentType: paymentConfig.paymentType || businessObj.paymentType || 'TILL',
                    tillNumber: paymentConfig.tillNumber || businessObj.tillNumber || '',
                    paybillNumber: paymentConfig.paybillNumber || businessObj.paybillNumber || '',
                    accountNumber: paymentConfig.accountNumber || businessObj.accountNumber || '',
                    pochiNumber: paymentConfig.pochiNumber || businessObj.pochiNumber || '',
                };

                setInitialValues(mapped);
                setCurrentLogoUrl(mapped.logoUrl);
                setPaymentType(mapped.paymentType);
            } catch (error) {
                console.error('Error fetching business:', error);
                showToaster(false, 'Error', 'Failed to load business details.');
                setTimeout(() => navigate('/businesses'), 1200);
            } finally {
                setLoading(false);
            }
        };

        fetchBusiness();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const submitBusiness = async (values) => {
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const formData = new FormData();

            let formattedPochiNumber = values.pochiNumber;
            if (values.paymentType === 'POCHI' && values.pochiNumber) {
                formattedPochiNumber = values.pochiNumber.toString().replace(/\D/g, '');
                if (formattedPochiNumber.startsWith('0')) {
                    formattedPochiNumber = '254' + formattedPochiNumber.substring(1);
                } else if (
                    (formattedPochiNumber.startsWith('7') || formattedPochiNumber.startsWith('1')) &&
                    formattedPochiNumber.length === 9
                ) {
                    formattedPochiNumber = '254' + formattedPochiNumber;
                }
            }

            const textFields = {
                businessName: values.businessName,
                registrationNumber: values.registrationNumber,
                address: values.address,
                businessType: values.businessType,
                email: values.email,
                phone: values.phone,
                website: values.website || '',
                description: values.description || '',
                primaryColor: values.primaryColor,
                status: values.status.toLowerCase(),
                owner: values.owner || '',
                paymentType: values.paymentType || 'TILL',
                tillNumber: values.paymentType === 'TILL' ? values.tillNumber || '' : '',
                paybillNumber: values.paymentType === 'PAYBILL' ? values.paybillNumber || '' : '',
                accountNumber: values.paymentType === 'PAYBILL' ? values.accountNumber || '' : '',
                pochiNumber: values.paymentType === 'POCHI' ? formattedPochiNumber || '' : '',
            };

            Object.entries(textFields).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, value);
                }
            });

            if (values.logoFile && values.logoFile instanceof File) {
                formData.append('logo', values.logoFile);
            } else if (isEditing) {
                formData.append('logoUrl', values.logoUrl || '');
            } else {
                formData.append('logoUrl', '');
            }

            const token = localStorage.getItem('token') || '';
            let response;

            if (isEditing) {
                const url = URLS.BUSINESS.UPDATE_BUSINESS.replace(':id', values.id);
                response = await PUT(url, formData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                response = await POST(URLS.BUSINESS.CREATE_BUSINESS, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            if (isFailureResponse(response)) {
                throw new Error(getResponseErrorMessage(response, `Failed to ${isEditing ? 'update' : 'create'} business.`));
            }

            const successMessage = isEditing
                ? `Business "${values.businessName}" updated successfully!`
                : `Business "${values.businessName}" created successfully!`;

            navigate('/businesses', {
                state: { toast: { state: true, title: 'Success', message: successMessage } },
            });
        } catch (error) {
            console.error('Error saving business:', error);
            let serverError = 'A server error occurred. Please try again.';
            if (error.response?.data?.message) {
                serverError = error.response.data.message;
            } else if (error.response?.data?.errors) {
                serverError = `Validation failed: ${error.response.data.errors.map((e) => e.message).join(', ')}`;
            } else if (error.message) {
                serverError = error.message;
            }
            const message = `Failed to ${isEditing ? 'update' : 'create'} business: ${serverError}`;
            setErrorMessage(message);
            showToaster(false, 'Error', message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema: businessValidationSchema,
        onSubmit: (values) => {
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
            submitBusiness(cleanedValues);
        },
        enableReinitialize: true,
        validateOnBlur: true,
        validateOnChange: true,
    });

    const handleFileDelete = () => {
        formik.setFieldValue('logoFile', null);
        formik.setFieldTouched('logoFile', false);
        formik.setFieldValue('logoUrl', null);
        setCurrentLogoUrl(null);
    };

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        formik.setFieldValue(name, value);
        formik.setFieldTouched(name, true, false);
        if (name === 'paymentType') setPaymentType(value);
    };

    const handleSelectBlur = (event) => {
        formik.setFieldTouched(event.target.name, true, true);
    };

    const handleInputChange = (event) => formik.handleChange(event);

    const handleInputBlur = (event) => {
        formik.handleBlur(event);
        formik.setFieldTouched(event.target.name, true, true);
    };

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        formik.setFieldValue('logoFile', file);
        formik.setFieldTouched('logoFile', true, true);
    };

    const shouldShowError = (field) => formik.touched[field] && !!formik.errors[field];
    const getErrorMessage = (field) => (shouldShowError(field) ? formik.errors[field] : '');

    const businessTypeOptions = businessTypes.map((type) => ({ value: type, label: type }));
    const statusOptions = [
        { value: 'ACTIVE', label: 'ACTIVE' },
        { value: 'INACTIVE', label: 'INACTIVE' },
    ];
    const paymentTypeOptions = PAYMENT_TYPES.map((type) => ({ value: type.value, label: type.label, icon: type.icon }));

    const handleCancel = () => navigate('/businesses');

    const renderPaymentFields = () => {
        switch (paymentType) {
            case 'TILL':
                return (
                    <div className="sm:col-span-2">
                        <TextInput
                            id="tillNumber"
                            label="Till Number"
                            placeholder="e.g., 123456"
                            input={formik.values.tillNumber}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="tillNumber"
                            required
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
                        <TextInput
                            id="paybillNumber"
                            label="Paybill Number"
                            placeholder="e.g., 123456"
                            input={formik.values.paybillNumber}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="paybillNumber"
                            required
                            disabled={submitting}
                            error={shouldShowError('paybillNumber')}
                            errorMessage={getErrorMessage('paybillNumber')}
                            helperText="Business Paybill number"
                        />
                        <TextInput
                            id="accountNumber"
                            label="Account Number"
                            placeholder="e.g., ACC001 or Business Name"
                            input={formik.values.accountNumber}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="accountNumber"
                            required
                            disabled={submitting}
                            error={shouldShowError('accountNumber')}
                            errorMessage={getErrorMessage('accountNumber')}
                            helperText="Account number for the paybill"
                        />
                    </>
                );
            case 'POCHI':
                return (
                    <div className="sm:col-span-2">
                        <TextInput
                            id="pochiNumber"
                            label="Pochi La Biashara Number"
                            placeholder="e.g., 254712345678"
                            input={formik.values.pochiNumber}
                            handleInput={handleInputChange}
                            handleBlur={handleInputBlur}
                            name="pochiNumber"
                            required
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ContentLoader
                    state={true}
                    loading={true}
                    loadingText="Loading business details..."
                    loadedText=""
                    color={accentColor}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster
                open={toaster.open}
                state={toaster.state}
                title={toaster.title}
                message={toaster.message}
                action={(open) => setToaster({ ...toaster, open })}
                position="right"
            />

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
                <button
                    onClick={handleCancel}
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to Businesses
                </button>

                <header className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div
                        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
                        style={{ backgroundColor: accentColor }}
                    >
                        <Building2 size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                            {isEditing ? 'Edit Business' : 'Add New Business'}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {isEditing ? 'Update the business details below' : 'Fill in the details to onboard a new business'}
                        </p>
                    </div>
                </header>

                <form onSubmit={formik.handleSubmit}>
                    {errorMessage && (
                        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        </div>
                    )}

                    <div className="space-y-4 sm:space-y-5">
                        <SectionCard icon={Building2} title="Business Information" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TextInput
                                    id="businessName"
                                    label="Business Name"
                                    placeholder="e.g., Grand Hotel Plaza"
                                    input={formik.values.businessName}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    name="businessName"
                                    required
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
                                    required
                                    disabled={isEditing || submitting}
                                    error={shouldShowError('registrationNumber')}
                                    errorMessage={getErrorMessage('registrationNumber')}
                                />
                                <TextInput
                                    id="owner"
                                    label="Owner Full Name"
                                    placeholder="e.g., Jane Doe"
                                    input={formik.values.owner}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    name="owner"
                                    required
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
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('businessType')}
                                    errorMessage={getErrorMessage('businessType')}
                                />
                                <TextInput
                                    id="address"
                                    label="Address"
                                    placeholder="Full business address"
                                    input={formik.values.address}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    name="address"
                                    required
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
                                <TextInput
                                    id="email"
                                    label="Email"
                                    placeholder="business@example.com"
                                    input={formik.values.email}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    name="email"
                                    type="email"
                                    required
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
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('phone')}
                                    errorMessage={getErrorMessage('phone')}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard icon={CreditCard} title="Payment Configuration" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectInput
                                    id="paymentType"
                                    name="paymentType"
                                    label="Payment Type"
                                    options={paymentTypeOptions}
                                    value={formik.values.paymentType}
                                    onChange={handleSelectChange}
                                    onBlur={handleSelectBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('paymentType')}
                                    errorMessage={getErrorMessage('paymentType')}
                                    helperText="Select the type of M-Pesa payment method"
                                />
                                {renderPaymentFields()}
                            </div>
                        </SectionCard>

                        <SectionCard icon={SettingsIcon} title="Business Settings" accentColor={accentColor}>
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
                        </SectionCard>

                        <SectionCard icon={ImageIcon} title="Business Media" accentColor={accentColor}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <FileInput
                                    id="logoFile"
                                    showImage
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
                        </SectionCard>
                    </div>

                    <div className="sticky bottom-0 mt-6 sm:mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50/95 backdrop-blur border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 max-w-5xl mx-auto">
                            <div className="sm:w-40">
                                <AppFormButton
                                    text="Cancel"
                                    color="invert"
                                    isLoading={false}
                                    validation={true}
                                    action={handleCancel}
                                />
                            </div>
                            <div className="sm:w-56">
                                <AppFormButton
                                    text={submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Business'}
                                    color={accentColor}
                                    isLoading={submitting}
                                    validation={formik.isValid && !submitting}
                                    action={formik.handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBusinessPage;
