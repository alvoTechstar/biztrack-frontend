import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ArrowLeft, Package, Tag, Warehouse } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import TextInput from '../../../../../components/Input/TextInput';
import SelectInput from '../../../../../components/Input/SelectInput';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import ContentLoader from '../../../../../components/Loader/ContentLoader';
import Toaster from '../../../../../components/Toaster';
import { GET, POST, PUT } from '../../../../../services/DatabaseServiceImp';
import URLS from '../../../../../utilities/Endpoints';

const UNIT_OPTIONS = [
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "l", label: "Liters (l)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
    { value: "bottle", label: "Bottle" },
    { value: "can", label: "Can" },
    { value: "jar", label: "Jar" },
    { value: "bag", label: "Bag" },
    { value: "carton", label: "Carton" },
    { value: "dozen", label: "Dozen" },
    { value: "pair", label: "Pair" },
    { value: "set", label: "Set" },
    { value: "roll", label: "Roll" },
    { value: "meter", label: "Meter (m)" },
    { value: "cm", label: "Centimeter (cm)" },
    { value: "packet", label: "Packet" },
    { value: "tin", label: "Tin" },
    { value: "tube", label: "Tube" },
    { value: "bar", label: "Bar" },
    { value: "sachet", label: "Sachet" },
    { value: "bunch", label: "Bunch" },
    { value: "slice", label: "Slice" },
];

const CATEGORY_OPTIONS = [
    { value: "Beverages", label: "Beverages" },
    { value: "Food & Groceries", label: "Food & Groceries" },
    { value: "Snacks", label: "Snacks" },
    { value: "Dairy Products", label: "Dairy Products" },
    { value: "Bakery", label: "Bakery" },
    { value: "Fruits & Vegetables", label: "Fruits & Vegetables" },
    { value: "Meat & Poultry", label: "Meat & Poultry" },
    { value: "Seafood", label: "Seafood" },
    { value: "Frozen Foods", label: "Frozen Foods" },
    { value: "Canned Goods", label: "Canned Goods" },
    { value: "Condiments & Spices", label: "Condiments & Spices" },
    { value: "Cooking Oil", label: "Cooking Oil" },
    { value: "Grains & Cereals", label: "Grains & Cereals" },
    { value: "Personal Care", label: "Personal Care" },
    { value: "Household Items", label: "Household Items" },
    { value: "Cleaning Supplies", label: "Cleaning Supplies" },
    { value: "Health & Wellness", label: "Health & Wellness" },
    { value: "Baby Products", label: "Baby Products" },
    { value: "Pet Supplies", label: "Pet Supplies" },
    { value: "Stationery", label: "Stationery" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Footwear", label: "Footwear" },
    { value: "Accessories", label: "Accessories" },
    { value: "Home & Garden", label: "Home & Garden" },
    { value: "Automotive", label: "Automotive" },
    { value: "Sports & Outdoors", label: "Sports & Outdoors" },
    { value: "Toys & Games", label: "Toys & Games" },
    { value: "Books & Media", label: "Books & Media" },
    { value: "Office Supplies", label: "Office Supplies" },
];

const productValidationSchema = yup.object({
    name: yup.string().required('Product name is required').min(2, 'Product name must be at least 2 characters').max(100, 'Product name must be less than 100 characters'),
    sku: yup.string().required('SKU is required').matches(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
    category: yup.string().required('Category is required'),
    stock: yup.number().required('Stock is required').min(0, 'Stock cannot be negative').integer('Stock must be a whole number'),
    unit: yup.string().required('Unit of measure is required'),
    buyingPrice: yup.number().required('Buying price is required').min(0.01, 'Buying price must be greater than 0').typeError('Buying price must be a valid number'),
    price: yup.number().required('Selling price is required').min(0.01, 'Selling price must be greater than 0').typeError('Selling price must be a valid number')
        .test('price-greater-than-buying', 'Selling price must be greater than or equal to buying price', function (value) {
            const { buyingPrice } = this.parent;
            return value >= buyingPrice;
        }),
    threshold: yup.number().required('Low stock threshold is required').min(0, 'Threshold cannot be negative').integer('Threshold must be a whole number'),
});

const blankFormData = {
    _id: '',
    name: '',
    sku: '',
    category: '',
    stock: 0,
    unit: '',
    buyingPrice: 0,
    price: 0,
    threshold: 0,
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

const CreateProductPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const accentColor = theme.primaryColor || '#2563eb';
    const currentUser = useSelector((state) => state.auth?.value);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [businessInfo, setBusinessInfo] = useState({ businessId: null, businessUUID: null });
    const [existingCategories, setExistingCategories] = useState([]);
    const [initialValues, setInitialValues] = useState(blankFormData);
    const [toaster, setToaster] = useState({ open: false, state: 'true', title: '', message: '' });

    const showToaster = (state, title, message) => {
        setToaster({ open: true, state: state ? 'true' : 'false', title, message });
    };

    useEffect(() => {
        if (!currentUser) return;
        const userBusinessId = currentUser.businessId || currentUser.businessID;
        if (userBusinessId) {
            setBusinessInfo({
                businessId: Number(userBusinessId),
                businessUUID: currentUser.businessUUID,
            });
        } else {
            setErrorMessage('No business assigned to your account. Please contact administrator.');
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!businessInfo.businessId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const endpoint = URLS.PRODUCTS.GET_PRODUCTS_BY_BUSINESS.replace(':businessId', businessInfo.businessId);
                const result = await GET(endpoint);
                const productData = result?.products || result?.data || [];

                setExistingCategories([...new Set(productData.map((p) => p.category).filter(Boolean))]);

                if (isEditing) {
                    const match = productData.find((p) => (p._id || p.id)?.toString() === id);
                    if (!match) {
                        throw new Error('Product not found');
                    }
                    setInitialValues({
                        _id: match._id || match.id || '',
                        name: String(match.name || ''),
                        sku: String(match.sku || ''),
                        category: String(match.category || ''),
                        stock: Number(match.stock) || 0,
                        unit: String(match.unit || ''),
                        buyingPrice: Number(match.buyingPrice) || 0,
                        price: Number(match.price) || 0,
                        threshold: Number(match.threshold) || 0,
                    });
                }
            } catch (error) {
                console.error('Error loading product form data:', error);
                showToaster(false, 'Error', 'Failed to load product details.');
                setTimeout(() => navigate('/products/stock-management'), 1200);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessInfo.businessId, id]);

    const submitProduct = async (values) => {
        setSubmitting(true);
        setErrorMessage(null);

        try {
            const productData = {
                name: String(values.name || '').trim(),
                sku: String(values.sku || '').trim().toUpperCase(),
                category: String(values.category || '').trim(),
                stock: parseInt(values.stock) || 0,
                unit: String(values.unit || '').trim(),
                buyingPrice: parseFloat(values.buyingPrice) || 0,
                price: parseFloat(values.price) || 0,
                threshold: parseInt(values.threshold) || 0,
                businessId: Number(businessInfo.businessId),
                businessUUID: businessInfo.businessUUID,
            };

            let response;
            if (isEditing) {
                const updateEndpoint = URLS.PRODUCTS.UPDATE_PRODUCT.replace(':id', values._id);
                response = await PUT(updateEndpoint, productData);
            } else {
                response = await POST(URLS.PRODUCTS.CREATE_PRODUCT, productData);
            }

            if (!response?.success) {
                throw new Error(response?.message || `Failed to ${isEditing ? 'update' : 'add'} product.`);
            }

            const successMessage = isEditing
                ? `Product "${productData.name}" updated successfully!`
                : `Product "${productData.name}" added successfully!`;

            navigate('/products/stock-management', {
                state: { toast: { state: true, title: 'Success', message: successMessage } },
            });
        } catch (error) {
            console.error('Error saving product:', error);
            const message = error.response?.data?.message || error.message || `Failed to ${isEditing ? 'update' : 'add'} product.`;
            setErrorMessage(message);
            showToaster(false, isEditing ? 'Update Error' : 'Add Error', message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema: productValidationSchema,
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: submitProduct,
    });

    const categoryOptions = useMemo(() => {
        const options = [...CATEGORY_OPTIONS];
        existingCategories.forEach((cat) => {
            if (!options.some((opt) => opt.value === cat)) {
                options.push({ value: cat, label: cat });
            }
        });
        if (formik.values.category && !options.some((opt) => opt.value === formik.values.category)) {
            options.push({ value: formik.values.category, label: formik.values.category });
        }
        return options;
    }, [existingCategories, formik.values.category]);

    const currentStatus = useMemo(() => {
        const stock = formik.values.stock || 0;
        const threshold = formik.values.threshold || 0;
        if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600' };
        if (stock < threshold) return { label: 'Low Stock', color: 'text-amber-600' };
        return { label: 'In Stock', color: 'text-green-600' };
    }, [formik.values.stock, formik.values.threshold]);

    const handleCancel = () => navigate('/products/stock-management');

    const handleInputChange = (event) => formik.handleChange(event);
    const handleInputBlur = (event) => formik.handleBlur(event);
    const handleSkuChange = (event) => {
        const value = event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        formik.setFieldValue('sku', value);
    };
    const shouldShowError = (field) => formik.touched[field] && !!formik.errors[field];
    const getErrorMessage = (field) => (shouldShowError(field) ? formik.errors[field] : '');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ContentLoader
                    state={true}
                    loading={true}
                    loadingText="Loading product details..."
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
                    Back to Stock Management
                </button>

                <header className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div
                        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
                        style={{ backgroundColor: accentColor }}
                    >
                        <Package size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {isEditing ? 'Update the product details below' : 'Fill in the details to add a new product'}
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
                        <SectionCard icon={Tag} title="Product Details" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <TextInput
                                    id="name"
                                    name="name"
                                    label="Product Name"
                                    placeholder="Enter product name"
                                    input={formik.values.name}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('name')}
                                    errorMessage={getErrorMessage('name')}
                                />
                                <TextInput
                                    id="sku"
                                    name="sku"
                                    label="SKU"
                                    placeholder="Enter SKU"
                                    input={formik.values.sku}
                                    handleInput={handleSkuChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('sku')}
                                    errorMessage={getErrorMessage('sku')}
                                />
                                <SelectInput
                                    id="category"
                                    name="category"
                                    label="Category"
                                    options={categoryOptions}
                                    value={formik.values.category}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('category')}
                                    errorMessage={getErrorMessage('category')}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard icon={Warehouse} title="Stock & Pricing" accentColor={accentColor}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <TextInput
                                    id="stock"
                                    name="stock"
                                    label="Current Stock"
                                    type="number"
                                    placeholder="0"
                                    input={formik.values.stock}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('stock')}
                                    errorMessage={getErrorMessage('stock')}
                                />
                                <SelectInput
                                    id="unit"
                                    name="unit"
                                    label="Unit of Measure"
                                    options={UNIT_OPTIONS}
                                    value={formik.values.unit}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('unit')}
                                    errorMessage={getErrorMessage('unit')}
                                />
                                <TextInput
                                    id="threshold"
                                    name="threshold"
                                    label="Low Stock Threshold"
                                    type="number"
                                    placeholder="0"
                                    input={formik.values.threshold}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('threshold')}
                                    errorMessage={getErrorMessage('threshold')}
                                />
                                <TextInput
                                    id="buyingPrice"
                                    name="buyingPrice"
                                    label="Buying Price (KES)"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    input={formik.values.buyingPrice}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('buyingPrice')}
                                    errorMessage={getErrorMessage('buyingPrice')}
                                />
                                <TextInput
                                    id="price"
                                    name="price"
                                    label="Selling Price (KES)"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    input={formik.values.price}
                                    handleInput={handleInputChange}
                                    handleBlur={handleInputBlur}
                                    required
                                    disabled={submitting}
                                    error={shouldShowError('price')}
                                    errorMessage={getErrorMessage('price')}
                                />
                                {isEditing && (
                                    <div className="flex flex-col justify-center rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                                        <span className="text-xs text-gray-500">Current Status</span>
                                        <span className={`text-sm font-semibold ${currentStatus.color}`}>
                                            {currentStatus.label}
                                        </span>
                                    </div>
                                )}
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
                                    text={submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
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

export default CreateProductPage;
