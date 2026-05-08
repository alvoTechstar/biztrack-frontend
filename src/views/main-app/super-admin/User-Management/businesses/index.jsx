import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import BusinessControls from "./BusinessControls";
import BusinessTable from './BusinessTable';
import CreateBusinessForm from './CreateBusinessForm';
import { useActionModal } from '../../../../../hooks/useActionModal';
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import { GET, POST, PUT, DELETE } from "../../../../../services/DatabaseServiceImp";
import URLS from '../../../../../utilities/Endpoints';
import "../../../../../App.css";
import ActionModal from '../../../../../components/modal/ActionModal';
import Toaster from '../../../../../components/Toaster';

const businessTypes = ['Hotel', 'Kiosk', 'Hospital'];

const initialFormData = {
    businessName: '',
    registrationNumber: '',
    address: '',
    businessType: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    primaryColor: '#1976d2',
    status: 'NEW',
    logoFile: null,
    logoUrl: null,
    id: null,
    owner: '',
    // Payment configuration fields
    paymentType: 'TILL',
    tillNumber: '',
    paybillNumber: '',
    accountNumber: '',
    pochiNumber: '',
};

const getStatusColor = (status) => {
    switch (status) {
        case 'NEW': return 'text-orange-600';
        case 'ACTIVE': return 'text-green-600';
        case 'INACTIVE': return 'text-red-600';
        default: return 'text-gray-600';
    }
};

const safeDateToString = (dateValue) => {
    if (!dateValue) return 'Never';
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            return 'Never';
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        return 'Never';
    }
};

const BusinessesPage = () => {
    const theme = useTheme();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        startDate: null,
        endDate: null
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalLoadingText, setModalLoadingText] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createLoadingText, setCreateLoadingText] = useState("");
    const [loadingState, setLoadingState] = useState(true);
    const [loadingText, setLoadingText] = useState("");
    const [loadedText, setLoadedText] = useState("");
    const [toaster, setToaster] = useState({
        open: false,
        state: 'true',
        title: '',
        message: '',
    });

    const { modalState, openModal, closeModal, setReason, handleSubmit } = useActionModal();

    const showToaster = (state, title, message) => {
        setToaster({
            open: true,
            state: state ? 'true' : 'false',
            title,
            message,
        });
    };

    const extractDataFromResponse = (response) => {
        if (!response) return [];
        if (response.data !== undefined) {
            return Array.isArray(response.data) ? response.data : [response.data];
        }
        if (Array.isArray(response)) {
            return response;
        }
        if (response._doc) {
            return [response._doc];
        }
        if (typeof response === 'object' && response !== null) {
            return [response];
        }
        return [];
    };

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        setLoadingState(true);
        setLoadingText("Fetching businesses...");
        setErrorMessage(null);

        try {
            const result = await GET(URLS.BUSINESS.GET_ALL_BUSINESSES);
            let businessData = extractDataFromResponse(result);
            const fetchedBusinesses = businessData.map(business => {
                const businessObj = business._doc || business;

                // Handle payment config from response
                const paymentConfig = businessObj.paymentConfig || {};

                return {
                    id: businessObj.id || businessObj._id?.toString(),
                    businessId: businessObj.businessID || businessObj.businessId || '',
                    name: businessObj.businessName || businessObj.name || '',
                    registrationNumber: businessObj.registrationNumber || '',
                    address: businessObj.address || '',
                    type: businessObj.businessType || businessObj.type || '',
                    email: businessObj.email || '',
                    phone: businessObj.phone || '',
                    website: businessObj.website || '',
                    primaryColor: businessObj.primaryColor || '#1976d2',
                    description: businessObj.description || '',
                    status: (businessObj.status || 'NEW').toUpperCase(),
                    createdAt: safeDateToString(businessObj.createdAt),
                    logoUrl: businessObj.logoUrl || businessObj.logo || null,
                    owner: businessObj.owner || '',
                    // Payment fields from paymentConfig or root level
                    paymentType: paymentConfig.paymentType || businessObj.paymentType || 'TILL',
                    tillNumber: paymentConfig.tillNumber || businessObj.tillNumber || '',
                    paybillNumber: paymentConfig.paybillNumber || businessObj.paybillNumber || '',
                    accountNumber: paymentConfig.accountNumber || businessObj.accountNumber || '',
                    pochiNumber: paymentConfig.pochiNumber || businessObj.pochiNumber || '',
                };
            });
            setBusinesses(fetchedBusinesses);
            setLoadingState(true);
            setLoadedText("Businesses loaded successfully");
            showToaster(true, 'Success', 'Businesses loaded successfully');
            setTimeout(() => {
                setLoading(false);
            }, 1000);

        } catch (error) {
            console.error('❌ Error fetching businesses:', error);
            const errorMsg = 'Failed to load businesses. Please try again.';
            setErrorMessage(errorMsg);
            setBusinesses([]);
            setLoadingState(false);
            setLoadedText("Failed to load businesses");
            showToaster(false, 'Error', errorMsg);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    }, []);

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    const openModalWithLoader = async (modalType, business = null) => {
        setModalLoading(true);
        switch (modalType) {
            case 'create':
                setModalLoadingText("Loading create form...");
                break;
            case 'edit':
                setModalLoadingText("Loading edit form...");
                break;
            case 'view':
                setModalLoadingText("Loading business details...");
                break;
            default:
                setModalLoadingText("Loading...");
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (business) {
            const businessData = {
                id: business.id || null,
                businessName: business.name || '',
                registrationNumber: business.registrationNumber || '',
                address: business.address || '',
                businessType: business.type || '',
                email: business.email || '',
                phone: business.phone || '',
                website: business.website || '',
                description: business.description || '',
                primaryColor: business.primaryColor || '#1976d2',
                status: business.status || 'NEW',
                logoFile: null,
                logoUrl: business.logoUrl || null,
                owner: business.owner || '',
                // Include payment fields when editing
                paymentType: business.paymentType || 'TILL',
                tillNumber: business.tillNumber || '',
                paybillNumber: business.paybillNumber || '',
                accountNumber: business.accountNumber || '',
                pochiNumber: business.pochiNumber || '',
            };
            setSelectedBusiness(businessData);
        } else {
            setSelectedBusiness(null);
        }
        setModalLoading(false);
        setFormMode(modalType);
        setShowCreateForm(true);
    };

    const openActionModalWithLoader = async (actionType, business) => {
        setModalLoading(true);

        switch (actionType) {
            case 'enable':
                setModalLoadingText("Preparing to enable business...");
                break;
            case 'disable':
                setModalLoadingText("Preparing to disable business...");
                break;
            case 'delete':
                setModalLoadingText("Preparing to delete business...");
                break;
            default:
                setModalLoadingText("Loading...");
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        const businessName = business.name || 'this business';
        switch (actionType) {
            case 'enable':
                openModal(
                    'enable',
                    business.id,
                    businessName,
                    'business',
                    (id, reason) => handleToggleStatus(id, 'active', reason),
                    `You are about to enable "${businessName}". By enabling, all the users for that business will regain access to the BizTrack application.`
                );
                break;
            case 'disable':
                openModal(
                    'disable',
                    business.id,
                    businessName,
                    'business',
                    (id, reason) => handleToggleStatus(id, 'inactive', reason),
                    `You are about to disable "${businessName}". By disabling, all the users for that business will no longer have access to the BizTrack application.`
                );
                break;
            case 'delete':
                openModal(
                    'delete',
                    business.id,
                    businessName,
                    'business',
                    (id, reason) => handleDeleteBusiness(id, reason),
                    `You are about to delete "${businessName}". By deleting, all the users for that business will no longer have access to the BizTrack application and all data will be permanently removed.`
                );
                break;
            default:
                console.warn('Unknown action type:', actionType);
        }

        setModalLoading(false);
    };

    const openCreateModal = () => openModalWithLoader('create');
    const openEditModal = (business) => openModalWithLoader('edit', business);
    const openEnableView = (business) => openModalWithLoader('view', business);
    const openEnableModal = (business) => openActionModalWithLoader('enable', business);
    const openDisableModal = (business) => openActionModalWithLoader('disable', business);
    const openDeleteModal = (business) => openActionModalWithLoader('delete', business);

    const closeAllModals = () => {
        setShowCreateForm(false);
        setSelectedBusiness(null);
        setErrorMessage(null);
        closeModal();
    };
    const handleFormSubmit = async (values) => {
        setSubmitting(true);
        setCreateLoading(true);
        setCreateLoadingText(formMode === 'edit' ? "Updating business..." : "Creating business...");
        setErrorMessage(null);

        try {
            const formData = new FormData();

            // Format phone numbers if they exist
            let formattedPochiNumber = values.pochiNumber;
            if (values.paymentType === 'POCHI' && values.pochiNumber) {
                // Remove any non-digit characters
                formattedPochiNumber = values.pochiNumber.toString().replace(/\D/g, '');

                // Convert to 254 format for backend
                if (formattedPochiNumber.startsWith('0')) {
                    formattedPochiNumber = '254' + formattedPochiNumber.substring(1);
                } else if (formattedPochiNumber.startsWith('7') && formattedPochiNumber.length === 9) {
                    formattedPochiNumber = '254' + formattedPochiNumber;
                } else if (formattedPochiNumber.startsWith('1') && formattedPochiNumber.length === 9) {
                    formattedPochiNumber = '254' + formattedPochiNumber;
                }

                console.log('📱 Formatted POCHI number:', {
                    original: values.pochiNumber,
                    cleaned: values.pochiNumber.toString().replace(/\D/g, ''),
                    formatted: formattedPochiNumber
                });
            }

            // Include all text fields including payment configuration
            const textFields = {
                'businessName': values.businessName,
                'registrationNumber': values.registrationNumber,
                'address': values.address,
                'businessType': values.businessType,
                'email': values.email,
                'phone': values.phone,
                'website': values.website || '',
                'description': values.description || '',
                'primaryColor': values.primaryColor,
                'status': values.status.toLowerCase(),
                'owner': values.owner || '',
                // Payment configuration fields
                'paymentType': values.paymentType || 'TILL',
                'tillNumber': values.tillNumber || '',
                'paybillNumber': values.paybillNumber || '',
                'accountNumber': values.accountNumber || '',
                'pochiNumber': formattedPochiNumber || '',
            };

            // Log payment fields for debugging
            console.log('💰 Payment fields being sent:', {
                paymentType: textFields.paymentType,
                pochiNumber: textFields.pochiNumber,
                tillNumber: textFields.tillNumber,
                paybillNumber: textFields.paybillNumber,
                accountNumber: textFields.accountNumber
            });

            // Append all text fields to FormData
            Object.entries(textFields).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, value);
                }
            });

            // Handle logo file upload
            if (values.logoFile && values.logoFile instanceof File) {
                formData.append('logo', values.logoFile);
            } else if (formMode === 'edit') {
                if (values.logoUrl === null || values.logoUrl === '') {
                    formData.append('logoUrl', '');
                } else if (values.logoUrl) {
                    formData.append('logoUrl', values.logoUrl);
                }
            } else {
                formData.append('logoUrl', '');
            }

            // Log the FormData contents for debugging
            console.log('📤 Submitting business with payment config:');
            for (let [key, value] of formData.entries()) {
                console.log(`   ${key}: ${value}`);
            }

            let response;
            let url;
            const token = localStorage.getItem('token') || '';

            if (formMode === 'edit' && values.id) {
                url = URLS.BUSINESS.UPDATE_BUSINESS.replace(':id', values.id);
                response = await PUT(url, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } else {
                url = URLS.BUSINESS.CREATE_BUSINESS;
                response = await POST(url, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }

            console.log('✅ Business saved successfully:', response.data);

            const successMessage = formMode === 'edit'
                ? `Business "${values.businessName}" updated successfully!`
                : `Business "${values.businessName}" created successfully!`;

            setCreateLoadingText(successMessage);
            showToaster(true, 'Success', successMessage);

            await new Promise(resolve => setTimeout(resolve, 1500));
            await fetchBusinesses();
            closeAllModals();

        } catch (error) {
            console.error('❌ Error saving business:', error);

            let serverError = 'A server error occurred. Please try again.';
            let validationErrors = [];

            if (error.response?.data?.message) {
                serverError = error.response.data.message;
            } else if (error.response?.data?.errors) {
                validationErrors = error.response.data.errors;
                serverError = `Validation failed: ${validationErrors.map(err => err.message).join(', ')}`;
            } else if (error.message) {
                serverError = error.message;
            }

            const errorMessage = `Failed to ${formMode === 'edit' ? 'update' : 'create'} business: ${serverError}`;
            setErrorMessage(errorMessage);
            showToaster(false, 'Error', errorMessage);

            // Scroll to top to show error message
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } finally {
            setSubmitting(false);
            setCreateLoading(false);
        }
    };

    const handleDeleteBusiness = async (businessId, reason) => {
        try {
            const response = await DELETE(URLS.BUSINESS.DELETE_BUSINESS.replace(':id', businessId), { reason });

            const business = businesses.find(b => b.id === businessId);
            const businessName = business?.name || 'Business';
            showToaster(true, 'Success', `Business "${businessName}" deleted successfully!`);
            await fetchBusinesses();
        } catch (error) {
            console.error('Error deleting business:', error);
            showToaster(false, 'Error', 'Failed to delete business. Please try again.');
            throw error;
        }
    };

    const handleToggleStatus = async (businessId, newStatus, reason) => {
        try {
            const response = await PUT(URLS.BUSINESS.TOGGLE_BUSINESS_STATUS.replace(':id', businessId), {
                status: newStatus,
                reason: reason
            });
            const business = businesses.find(b => b.id === businessId);
            const businessName = business?.name || 'Business';
            const statusMessage = newStatus === 'active' ? 'enabled' : 'disabled';
            showToaster(true, 'Success', `Business "${businessName}" ${statusMessage} successfully!`);
            await fetchBusinesses();
        } catch (error) {
            console.error('Error toggling status:', error);
            showToaster(false, 'Error', 'Failed to update business status. Please try again.');
            throw error;
        }
    };

    const toggleSelectAll = (filteredList) => {
        if (selectedItems.length === filteredList.length && filteredList.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredList.map(b => b.id));
        }
    };

    const toggleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredBusinesses = businesses.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filters.status || b.status === filters.status;
        const matchesType = !filters.type || b.type === filters.type;
        return matchesSearch && matchesStatus && matchesType;
    });

    if (createLoading) {
        return (
            <div className="min-h-screen bg-white p-3 xs:p-4 sm:p-6">
                <div className="w-full max-w-7xl mx-auto">
                    <div className='main-app-view'>
                        <div className="main-app-content-container w-full">
                            <div className="w-full flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
                                <div className="w-full px-2 xs:px-4">
                                    <ContentLoader
                                        state={true}
                                        loading={true}
                                        loadingText={loadingText}
                                        loadedText={loadedText}
                                        color={theme.primaryColor}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-3 xs:p-4 sm:p-6">
                <div className="w-full max-w-7xl mx-auto">
                    <div className='main-app-view'>
                        <div className="main-app-content-container w-full">
                            <div className="w-full flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
                                <div className="w-full px-2 xs:px-4">
                                    <ContentLoader
                                        state={true}
                                        loading={true}
                                        loadingText={loadingText}
                                        loadedText={loadedText}
                                        color={theme.primaryColor}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (modalLoading) {
        return (
            <div className="min-h-screen bg-white p-3 xs:p-4 sm:p-6">
                <div className="w-full max-w-7xl mx-auto">
                    <div className='main-app-view'>
                        <div className="main-app-content-container w-full">
                            <div className="w-full flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
                                <div className="w-full px-2 xs:px-4">
                                    <ContentLoader
                                        state={true}
                                        loading={true}
                                        loadingText={loadingText}
                                        loadedText={loadedText}
                                        color={theme.primaryColor}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }

    return (
        <div className="min-h-screen bg-white p-8">
            <Toaster
                open={toaster.open}
                state={toaster.state}
                title={toaster.title}
                message={toaster.message}
                action={(open) => setToaster({ ...toaster, open })}
                position="right"
            />

            <div className="max-w-7xl mx-auto">
                {modalState.isOpen && (
                    <ActionModal
                        isOpen={modalState.isOpen}
                        onClose={closeModal}
                        entityName={modalState.entityName}
                        actionType={modalState.actionType}
                        reason={modalState.reason}
                        setReason={setReason}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        customDescription={modalState.customDescription}
                    />
                )}
                {showCreateForm && (
                    <CreateBusinessForm
                        showModal={showCreateForm}
                        setShowModal={closeAllModals}
                        initialFormData={selectedBusiness || initialFormData}
                        handleSubmit={handleFormSubmit}
                        businessTypes={businessTypes}
                        isEditing={formMode === 'edit'}
                        currentLogoUrl={selectedBusiness?.logoUrl || null}
                        submitting={submitting}
                        readOnly={formMode === 'view'}
                        errorMessage={errorMessage} // Pass error to form for display
                    />
                )}
                {!showCreateForm && !modalState.isOpen && !modalLoading && !createLoading && (
                    <>
                        {businesses.length === 0 && filteredBusinesses.length === 0 && !searchTerm ? (
                            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                <Building2 size={64} className="text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! No Businesses</h3>
                                <p className="text-gray-500 mb-6">Get started by adding your first business</p>
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    <Plus size={20} />
                                    Add Business
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <span className="text-m font-bold text-gray-900">Businesses</span>
                                    <BusinessControls
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        filters={filters}
                                        setFilters={setFilters}
                                        businessTypes={businessTypes}
                                        selectedItems={selectedItems}
                                        setSelectedItems={setSelectedItems}
                                        openModal={openCreateModal}
                                    />

                                    <BusinessTable
                                        filteredBusinesses={filteredBusinesses}
                                        selectedItems={selectedItems}
                                        setSelectedItems={setSelectedItems}
                                        toggleSelectAll={() => toggleSelectAll(filteredBusinesses)}
                                        toggleSelectItem={toggleSelectItem}
                                        openModalForEdit={openEditModal}
                                        openEnableView={openEnableView}
                                        openEnableModal={openEnableModal}
                                        openDisableModal={openDisableModal}
                                        openDeleteModal={openDeleteModal}
                                        getStatusColor={getStatusColor}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        filters={filters}
                                        setFilters={setFilters}
                                        submitting={submitting}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BusinessesPage;