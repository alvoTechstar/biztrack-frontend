import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { ArrowLeft, UserRound, Building2 } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import TextInput from '../../../../../components/Input/TextInput';
import SelectInput from '../../../../../components/Input/SelectInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import ContentLoader from '../../../../../components/Loader/ContentLoader';
import Toaster from '../../../../../components/Toaster';
import { userValidationSchema } from '../../../../../utilities/validationSchemas';
import { GET, POST, PUT } from '../../../../../services/DatabaseServiceImp';
import URLS from '../../../../../utilities/Endpoints';
import { isFailureResponse, getResponseErrorMessage } from '../../../../../utilities/apiResponse';

const rolesByType = {
    'Hotel': ['Hotel Admin', 'Hotel Cashier', 'Hotel Waiter'],
    'Kiosk': ['Kiosk Admin', 'Kiosk Shopkeeper'],
    'Hospital': ['Hospital Admin', 'Doctor', 'Nurse', 'Lab Technician', 'Receptionist', 'Pharmacist'],
    'Retail': ['Retail Admin', 'Cashier', 'Sales Associate'],
    'System': ['System Admin', 'Support Staff'],
    'Other': ['Admin', 'Manager', 'Staff'],
};

const extractBusinessData = (business) => {
    if (!business) return null;
    const source = business._doc || business;
    const id = source.id || source._id?.toString();
    const name = source.businessName;
    if (!id || !name) return null;
    return {
        id,
        name,
        type: source.businessType,
        status: source.status,
    };
};

const blankFormData = {
    firstName: '',
    lastName: '',
    email: '',
    institutionId: '',
    role: '',
    username: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
};

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

const CreateUserPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const accentColor = theme.primaryColor || '#2563eb';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [initialValues, setInitialValues] = useState(blankFormData);
    const [editingUserId, setEditingUserId] = useState(null);
    const [toaster, setToaster] = useState({ open: false, state: 'true', title: '', message: '' });

    const showToaster = (state, title, message) => {
        setToaster({ open: true, state: state ? 'true' : 'false', title, message });
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const businessesResponse = await GET(URLS.BUSINESS.GET_ALL_BUSINESSES);
                const businessesData = Array.isArray(businessesResponse)
                    ? businessesResponse
                    : (businessesResponse?.data || businessesResponse?.businesses || []);
                setBusinesses(businessesData);

                if (isEditing) {
                    const url = URLS.USERS.GET_USER_BY_ID.replace(':id', id);
                    const result = await GET(url);
                    const raw = result?.data || result?.user || result;
                    const userObj = raw?._doc || raw;

                    if (!userObj || (!userObj.firstName && !userObj.email)) {
                        throw new Error('User not found');
                    }

                    setEditingUserId(userObj.id || userObj._id || id);
                    setInitialValues({
                        firstName: userObj.firstName || '',
                        lastName: userObj.lastName || '',
                        email: userObj.email || '',
                        institutionId: (userObj.businessId || userObj.associatedBusinessId || userObj.institutionId || '').toString(),
                        role: userObj.role || userObj.userRole || '',
                        username: userObj.username || '',
                        phoneNumber: userObj.phone || userObj.phoneNumber || '',
                        password: '',
                        confirmPassword: '',
                    });
                }
            } catch (error) {
                console.error('Error loading user form data:', error);
                showToaster(false, 'Error', 'Failed to load user details.');
                setTimeout(() => navigate('/user-management'), 1200);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const submitUser = async (values) => {
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const userData = {
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
                username: values.username.trim(),
                phoneNumber: values.phoneNumber.trim(),
                role: values.role,
                businessId: values.institutionId,
            };

            if (!isEditing && values.password) {
                userData.password = values.password;
            }

            let response;
            if (isEditing && editingUserId) {
                response = await PUT(URLS.USERS.UPDATE_USER.replace(':id', editingUserId), userData);
            } else {
                response = await POST(URLS.USERS.CREATE_USER, userData);
            }

            if (isFailureResponse(response)) {
                throw new Error(getResponseErrorMessage(response, `Failed to ${isEditing ? 'update' : 'create'} user.`));
            }

            const successMessage = isEditing
                ? `User "${values.firstName} ${values.lastName}" updated successfully!`
                : `User "${values.firstName} ${values.lastName}" created successfully!`;

            navigate('/user-management', {
                state: { toast: { state: true, title: 'Success', message: successMessage } },
            });
        } catch (error) {
            console.error('Error saving user:', error);
            let serverError = 'A server error occurred. Please try again.';
            if (error.response?.data?.message) {
                serverError = error.response.data.message;
            } else if (error.message) {
                serverError = error.message;
            }
            const message = `Failed to ${isEditing ? 'update' : 'create'} user: ${serverError}`;
            setErrorMessage(message);
            showToaster(false, 'Error', message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema: userValidationSchema,
        onSubmit: submitUser,
        enableReinitialize: true,
        validateOnBlur: true,
        validateOnChange: false,
    });

    // Auto-generate username from first/last name
    useEffect(() => {
        const firstName = formik.values.firstName?.trim() || '';
        const lastName = formik.values.lastName?.trim() || '';
        if (firstName && lastName && (!isEditing || !formik.values.username)) {
            formik.setFieldValue('username', `${firstName}${lastName}`.toLowerCase());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.firstName, formik.values.lastName]);

    const businessOptions = useMemo(() => {
        return businesses
            .map(extractBusinessData)
            .filter((b) => b && b.status?.toLowerCase() === 'active')
            .map((b) => ({ value: b.id.toString(), label: b.name }));
    }, [businesses]);

    const selectedBusiness = useMemo(() => {
        if (!formik.values.institutionId) return null;
        return businesses
            .map(extractBusinessData)
            .find((b) => b && b.id.toString() === formik.values.institutionId);
    }, [businesses, formik.values.institutionId]);

    const roleOptions = useMemo(() => {
        const availableRoles = selectedBusiness ? rolesByType[selectedBusiness.type] || [] : [];
        return availableRoles.map((role) => ({ value: role, label: role }));
    }, [selectedBusiness]);

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        formik.setFieldValue(name, value);
        if (name === 'institutionId') {
            formik.setFieldValue('role', '');
        }
    };

    const handleSelectBlur = (event) => {
        formik.setFieldTouched(event.target.name, true);
    };

    const handleInputChange = (event) => formik.handleChange(event);
    const handleInputBlur = (event) => formik.handleBlur(event);

    const shouldShowError = (field) => formik.touched[field] && !!formik.errors[field];
    const getErrorMessage = (field) => (shouldShowError(field) ? formik.errors[field] : '');

    const handleCancel = () => navigate('/user-management');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ContentLoader
                    state={true}
                    loading={true}
                    loadingText="Loading user details..."
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
                    Back to Users
                </button>

                <header className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div
                        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
                        style={{ backgroundColor: accentColor }}
                    >
                        <UserRound size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                            {isEditing ? 'Edit User' : 'Add New User'}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {isEditing ? 'Update the user details below' : 'Fill in the details to create a new user'}
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
                        <SectionCard icon={UserRound} title="Personal Information" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TextInput
                                    id="firstName"
                                    label="First Name"
                                    placeholder="John"
                                    input={formik.values.firstName}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    name="firstName"
                                    required
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
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('lastName')}
                                    errorMessage={getErrorMessage('lastName')}
                                />
                                <TextInput
                                    id="email"
                                    label="Email Address"
                                    placeholder="user@example.com"
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
                                    id="phoneNumber"
                                    label="Phone Number"
                                    placeholder="+254712345678"
                                    input={formik.values.phoneNumber}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('phoneNumber')}
                                    errorMessage={getErrorMessage('phoneNumber')}
                                />
                                <TextInput
                                    id="username"
                                    label="Username"
                                    placeholder="johndoe"
                                    input={formik.values.username}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    name="username"
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('username')}
                                    errorMessage={getErrorMessage('username')}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard icon={Building2} title="Business Assignment" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectInput
                                    id="institutionId"
                                    name="institutionId"
                                    label="Institution/Business"
                                    options={businessOptions}
                                    value={formik.values.institutionId}
                                    onChange={handleSelectChange}
                                    onBlur={handleSelectBlur}
                                    required
                                    disabled={submitting || businessOptions.length === 0}
                                    error={shouldShowError('institutionId')}
                                    errorMessage={getErrorMessage('institutionId')}
                                    placeholder={businessOptions.length === 0 ? 'No active businesses available' : 'Select a business'}
                                />
                                <SelectInput
                                    id="role"
                                    name="role"
                                    label="Role"
                                    options={roleOptions}
                                    value={formik.values.role}
                                    onChange={handleSelectChange}
                                    onBlur={handleSelectBlur}
                                    required
                                    disabled={submitting || !formik.values.institutionId || roleOptions.length === 0}
                                    error={shouldShowError('role')}
                                    errorMessage={getErrorMessage('role')}
                                    placeholder={
                                        !formik.values.institutionId
                                            ? 'Select a business first'
                                            : roleOptions.length === 0
                                                ? `No roles available for ${selectedBusiness?.type || 'this'} business`
                                                : 'Select a role'
                                    }
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
                                    text={submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add User'}
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

export default CreateUserPage;
