import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, UserRound, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../../../components/theme/ThemeContext';
import TextInput from '../../../../components/Input/TextInput';
import SelectInput from '../../../../components/Input/SelectInput';
import AppFormButton from '../../../../components/buttons/AppFormButton';
import ContentLoader from '../../../../components/Loader/ContentLoader';
import Toaster from '../../../../components/Toaster';
import { GET, POST, PUT } from '../../../../services/DatabaseServiceImp';
import URLS from '../../../../utilities/Endpoints';

// Role lists per business type — must match the space-separated role strings
// the super admin uses when creating users (see CreateUserPage's rolesByType).
const ROLES_BY_BUSINESS_TYPE = {
    Kiosk: ['Kiosk Admin', 'Kiosk Shopkeeper'],
    Hotel: ['Hotel Admin', 'Hotel Cashier', 'Hotel Waiter'],
};

const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required').min(2, 'First name must be at least 2 characters').max(50, 'First name cannot exceed 50 characters'),
    lastName: Yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters').max(50, 'Last name cannot exceed 50 characters'),
    email: Yup.string().required('Email is required').email('Invalid email address').max(100, 'Email cannot exceed 100 characters'),
    role: Yup.string().required('Role is required'),
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    phoneNumber: Yup.string().required('Phone number is required')
        .matches(/^\+?[\d\s\-().]{6,20}$/, 'Enter a valid phone number (e.g. 0712345678 or +254712345678)'),
});

const blankFormData = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    username: '',
    phoneNumber: '',
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

const CreateStaffPage = ({ basePath = '/kiosk/user-management' }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const accentColor = theme.primaryColor || '#2563eb';
    const currentUser = useSelector((state) => state.auth?.value);

    const currentBusiness = useMemo(() => {
        if (!currentUser) return null;
        const businessId = String(
            currentUser.businessId ||
            currentUser.businessUUID ||
            currentUser.associatedBusinessId ||
            currentUser.institutionId ||
            ''
        ).trim();
        return {
            id: businessId,
            name: currentUser.businessName || 'Your Business',
            type: currentUser.businessType || '',
        };
    }, [currentUser]);

    const availableRoles = useMemo(() => {
        return ROLES_BY_BUSINESS_TYPE[currentBusiness?.type] || [];
    }, [currentBusiness]);

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [initialValues, setInitialValues] = useState(blankFormData);
    const [editingStaffId, setEditingStaffId] = useState(null);
    const [toaster, setToaster] = useState({ open: false, state: 'true', title: '', message: '' });

    const showToaster = (state, title, message) => {
        setToaster({ open: true, state: state ? 'true' : 'false', title, message });
    };

    useEffect(() => {
        if (!isEditing) return;

        const loadStaff = async () => {
            setLoading(true);
            try {
                const url = URLS.USERS.GET_USER_BY_ID.replace(':id', id);
                const result = await GET(url);
                const raw = result?.data || result?.user || result;
                const staffObj = raw?._doc || raw;

                if (!staffObj || (!staffObj.firstName && !staffObj.email)) {
                    throw new Error('Staff member not found');
                }

                setEditingStaffId(staffObj.id || staffObj._id || id);
                setInitialValues({
                    firstName: staffObj.firstName || '',
                    lastName: staffObj.lastName || '',
                    email: staffObj.email || '',
                    role: staffObj.role || '',
                    username: staffObj.username || '',
                    phoneNumber: staffObj.phone || staffObj.phoneNumber || '',
                });
            } catch (error) {
                console.error('Error loading staff member:', error);
                showToaster(false, 'Error', 'Failed to load staff member details.');
                setTimeout(() => navigate(basePath), 1200);
            } finally {
                setLoading(false);
            }
        };

        loadStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const submitStaff = async (values) => {
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const staffData = {
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
                username: values.username.trim(),
                phone: values.phoneNumber.trim(),
                phoneNumber: values.phoneNumber.trim(),
                role: values.role,
                status: 'active',
                businessId: currentBusiness.id,
                associatedBusinessId: currentBusiness.id,
                institutionId: currentBusiness.id,
                businessName: currentBusiness.name,
                businessType: currentBusiness.type,
            };

            if (!isEditing) {
                staffData.password = 'Temporary123!';
            }

            let response;
            if (isEditing) {
                const endpoint = URLS.USERS.UPDATE_USER.replace(':id', editingStaffId);
                response = await PUT(endpoint, staffData);
            } else {
                response = await POST(URLS.USERS.CREATE_USER, staffData);
            }

            if (!response?.success) {
                throw new Error(response?.message || `Failed to ${isEditing ? 'update' : 'create'} staff member.`);
            }

            const staffName = `${staffData.firstName} ${staffData.lastName}`;
            const successMessage = isEditing
                ? `${staffName} has been updated successfully!`
                : `${staffName} has been added to your team!`;

            navigate(basePath, {
                state: { toast: { state: true, title: isEditing ? 'Staff Updated' : 'Staff Created', message: successMessage } },
            });
        } catch (error) {
            console.error('Error saving staff member:', error);
            const message = error.message || `Failed to ${isEditing ? 'update' : 'create'} staff member.`;
            setErrorMessage(message);
            showToaster(false, 'Error', message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: submitStaff,
    });

    // Auto-generate username from first/last name (create mode only)
    useEffect(() => {
        if (isEditing) return;
        const first = formik.values.firstName?.trim() || '';
        const last = formik.values.lastName?.trim() || '';
        if (!first || !last) return;
        const generated = `${first}${last}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (generated !== formik.values.username) {
            formik.setFieldValue('username', generated);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.firstName, formik.values.lastName]);

    const roleOptions = useMemo(() => availableRoles.map((role) => ({
        value: role,
        label: role.replace(/_/g, ' '),
    })), [availableRoles]);

    const handleCancel = () => navigate(basePath);
    const handleInputChange = (event) => formik.handleChange(event);
    const handleInputBlur = (event) => formik.handleBlur(event);
    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        formik.setFieldValue(name, value, true);
        formik.setFieldTouched(name, true, false);
    };
    const shouldShowError = (field) => formik.touched[field] && !!formik.errors[field];
    const getErrorMessage = (field) => (shouldShowError(field) ? formik.errors[field] : '');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ContentLoader
                    state={true}
                    loading={true}
                    loadingText="Loading staff member details..."
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
                    Back to Staff Management
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
                            {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {isEditing ? 'Update the staff member details below' : `Fill in the details to add a new team member to ${currentBusiness?.name || 'your business'}`}
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
                                    name="firstName"
                                    label="First Name"
                                    placeholder="John"
                                    input={formik.values.firstName}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('firstName')}
                                    errorMessage={getErrorMessage('firstName')}
                                />
                                <TextInput
                                    id="lastName"
                                    name="lastName"
                                    label="Last Name"
                                    placeholder="Doe"
                                    input={formik.values.lastName}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('lastName')}
                                    errorMessage={getErrorMessage('lastName')}
                                />
                                <TextInput
                                    id="email"
                                    name="email"
                                    label="Email Address"
                                    placeholder="user@example.com"
                                    type="email"
                                    input={formik.values.email}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('email')}
                                    errorMessage={getErrorMessage('email')}
                                />
                                <TextInput
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    label="Phone Number"
                                    placeholder="0712345678 or +254712345678"
                                    type="tel"
                                    input={formik.values.phoneNumber}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('phoneNumber')}
                                    errorMessage={getErrorMessage('phoneNumber')}
                                />
                                <TextInput
                                    id="username"
                                    name="username"
                                    label="Username"
                                    placeholder="johndoe"
                                    input={formik.values.username}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('username')}
                                    errorMessage={getErrorMessage('username')}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard icon={ShieldCheck} title="Business & Role" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[14px] leading-4 font-bold text-[#353f50] mb-1 block">
                                        Business
                                    </label>
                                    <div className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600">
                                        {currentBusiness?.name || 'Your Business'}
                                    </div>
                                </div>
                                <SelectInput
                                    id="role"
                                    name="role"
                                    label="Role"
                                    options={roleOptions}
                                    value={formik.values.role}
                                    onChange={handleSelectChange}
                                    onBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('role')}
                                    errorMessage={getErrorMessage('role')}
                                    placeholder="Select a role"
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
                                    isLoading={submitting}
                                    validation={true}
                                    action={handleCancel}
                                />
                            </div>
                            <div className="sm:w-56">
                                <AppFormButton
                                    text={submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Staff Member'}
                                    color={accentColor}
                                    isLoading={submitting}
                                    validation={formik.isValid}
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

export default CreateStaffPage;
