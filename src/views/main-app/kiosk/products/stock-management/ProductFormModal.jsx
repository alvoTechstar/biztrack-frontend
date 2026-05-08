import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  Fade,
  Box,
  styled,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from 'yup';
import TextInput from "../../../../../components/Input/TextInput";
import SelectInput from "../../../../../components/Input/SelectInput";
import AppFormButton from "../../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import Toaster from "../../../../../components/Toaster";

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    maxWidth: "500px",
    width: "100%",
  },
  "& .MuiBackdrop-root": {
    backdropFilter: "blur(1px)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
}));

const AnimatedBackdrop = styled(Backdrop)({
  zIndex: -1,
  position: "fixed",
  backdropFilter: "blur(1px)",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
});

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
  name: yup
    .string()
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  sku: yup
    .string()
    .required('SKU is required')
    .matches(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  category: yup
    .string()
    .required('Category is required'),
  stock: yup
    .number()
    .required('Stock is required')
    .min(0, 'Stock cannot be negative')
    .integer('Stock must be a whole number'),
  unit: yup
    .string()
    .required('Unit of measure is required'),
  buyingPrice: yup
    .number()
    .required('Buying price is required')
    .min(0.01, 'Buying price must be greater than 0')
    .typeError('Buying price must be a valid number'),
  price: yup
    .number()
    .required('Selling price is required')
    .min(0.01, 'Selling price must be greater than 0')
    .typeError('Selling price must be a valid number')
    .test(
      'price-greater-than-buying',
      'Selling price must be greater than or equal to buying price',
      function (value) {
        const { buyingPrice } = this.parent;
        return value >= buyingPrice;
      }
    ),
  threshold: yup
    .number()
    .required('Low stock threshold is required')
    .min(0, 'Threshold cannot be negative')
    .integer('Threshold must be a whole number')
});

export default function ProductFormModal({
  show,
  mode = "add",
  product = null,
  onClose,
  onSave,
  categories = [],
  businessId,
  businessUUID,
}) {
  const { primaryColor } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [toaster, setToaster] = useState({
    open: false,
    state: null,
    title: "",
    message: "",
    position: "right",
  });

  const modalTitle = mode === "edit" ? "Edit Product" : "Add New Product";
  const submitButtonText = mode === "edit" ? "Save Changes" : "Add Product";
  const loadingText = mode === "edit" ? "Saving..." : "Adding...";
  const successMessage = mode === "edit" ? "Product updated successfully" : "Product added successfully";

  // Memoized initial values that update when product changes
  const initialValues = useMemo(() => {
    console.log('🔄 Computing initial values - mode:', mode, 'product:', product);

    if (mode === "edit" && product) {
      const values = {
        _id: product._id || product.id || "",
        name: String(product.name || "").trim(),
        sku: String(product.sku || "").trim(),
        category: String(product.category || ""),
        stock: Number(product.stock) || 0,
        unit: String(product.unit || ""),
        buyingPrice: Number(product.buyingPrice) || 0,
        price: Number(product.price) || 0,
        threshold: Number(product.threshold) || 0,
        businessId: product.businessId || businessId,
        businessUUID: product.businessUUID || businessUUID,
      };
      console.log('✏️ Edit mode - initial values:', values);
      return values;
    }

    const values = {
      _id: "",
      name: "",
      sku: "",
      category: "",
      stock: 0,
      unit: "",
      buyingPrice: 0,
      price: 0,
      threshold: 0,
      businessId: businessId,
      businessUUID: businessUUID,
    };
    console.log('➕ Add mode - initial values:', values);
    return values;
  }, [product, mode, businessId, businessUUID]);

  // Initialize formik
  const formik = useFormik({
    initialValues,
    validationSchema: productValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setIsLoading(true);
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
          businessId: values.businessId || businessId,
          businessUUID: values.businessUUID || businessUUID,
        };

        if (mode === "edit" && values._id) {
          productData._id = values._id;
        }

        console.log('📤 Submitting product data:', productData);
        await onSave(productData);

        showToaster("success", "Success", successMessage);
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('❌ Error submitting product:', error);
        showToaster("error", "Error", error.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const showToaster = (state, title, message) => {
    setToaster({
      open: true,
      state: state,
      title,
      message,
      position: "right",
    });
  };

  const handleCloseToaster = () => {
    setToaster((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Build category options - always include all defaults + any passed categories
  const allCategories = useMemo(() => {
    let options = [...CATEGORY_OPTIONS];

    // Add any custom categories from props
    if (categories && Array.isArray(categories) && categories.length > 0) {
      categories.forEach(cat => {
        if (!options.some(opt => opt.value === cat)) {
          options.push({ value: cat, label: cat });
        }
      });
    }

    // Ensure current category is in the list
    if (formik.values.category && !options.some(opt => opt.value === formik.values.category)) {
      options.push({
        value: formik.values.category,
        label: formik.values.category
      });
    }

    console.log('📋 Category options:', options.length, 'options');
    return options;
  }, [categories, formik.values.category]);

  const calculateStatus = () => {
    const stock = formik.values.stock || 0;
    const threshold = formik.values.threshold || 0;

    if (stock === 0) return "Out of Stock";
    if (stock < threshold) return "Low Stock";
    return "In Stock";
  };

  if (!show) return null;

  return (
    <>
      <AnimatedBackdrop open={show} transitionDuration={300} />

      <StyledDialog
        open={show}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={show} timeout={300}>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <DialogTitle
              sx={{
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #e0e0e0",
                padding: "20px 24px",
                fontSize: "1.25rem",
                fontWeight: "600",
              }}
            >
              {modalTitle}
            </DialogTitle>

            <DialogContent sx={{ padding: "24px", paddingBottom: "0" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <TextInput
                    id="name"
                    name="name"
                    label="Product Name"
                    input={formik.values.name}
                    handleInput={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    placeholder="Enter product name"
                    required
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    errorMessage={formik.touched.name && formik.errors.name}
                  />

                  <TextInput
                    id="sku"
                    name="sku"
                    label="SKU"
                    input={formik.values.sku}
                    handleInput={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    placeholder="Enter SKU"
                    required
                    error={formik.touched.sku && Boolean(formik.errors.sku)}
                    errorMessage={formik.touched.sku && formik.errors.sku}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <TextInput
                    id="stock"
                    name="stock"
                    label="Current Stock"
                    type="number"
                    input={formik.values.stock}
                    handleInput={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    placeholder="0"
                    required
                    min="0"
                    error={formik.touched.stock && Boolean(formik.errors.stock)}
                    errorMessage={formik.touched.stock && formik.errors.stock}
                  />

                  <SelectInput
                    id="unit"
                    name="unit"
                    label="Unit of Measure"
                    options={UNIT_OPTIONS}
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    fullWidth
                    error={formik.touched.unit && Boolean(formik.errors.unit)}
                    helperText={formik.touched.unit && formik.errors.unit}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <TextInput
                    id="buyingPrice"
                    name="buyingPrice"
                    label="Buying Price (KES)"
                    type="number"
                    step="0.01"
                    input={formik.values.buyingPrice}
                    handleInput={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    placeholder="0.00"
                    required
                    min="0.01"
                    error={formik.touched.buyingPrice && Boolean(formik.errors.buyingPrice)}
                    errorMessage={formik.touched.buyingPrice && formik.errors.buyingPrice}
                  />

                  <TextInput
                    id="price"
                    name="price"
                    label="Selling Price (KES)"
                    type="number"
                    step="0.01"
                    input={formik.values.price}
                    handleInput={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    placeholder="0.00"
                    required
                    min="0.01"
                    error={formik.touched.price && Boolean(formik.errors.price)}
                    errorMessage={formik.touched.price && formik.errors.price}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <TextInput
                    id="threshold"
                    name="threshold"
                    label="Low Stock Threshold"
                    type="number"
                    input={formik.values.threshold}
                    handleInput={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    placeholder="0"
                    required
                    min="0"
                    error={formik.touched.threshold && Boolean(formik.errors.threshold)}
                    errorMessage={formik.touched.threshold && formik.errors.threshold}
                  />

                  <SelectInput
                    id="category"
                    name="category"
                    label="Category"
                    options={allCategories}
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    fullWidth
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={formik.touched.category && formik.errors.category}
                  />
                </Box>

                {mode === "edit" && (
                  <Box sx={{ mt: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <div className="text-sm">
                      <span className="text-gray-600">Current Status:</span>
                      <span
                        className={`font-semibold ml-2 ${calculateStatus() === "In Stock"
                            ? "text-green-600"
                            : calculateStatus() === "Low Stock"
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                      >
                        {calculateStatus()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Status updates automatically based on stock and threshold
                      </p>
                    </div>
                  </Box>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ paddingBottom: "35px", gap: "12px", margin: "0 30px 8px" }}>
              <AppFormButton
                text="Cancel"
                color="invert"
                action={handleClose}
                validation={true}
                disabled={isLoading}
                type="button"
              />

              <AppFormButton
                text={
                  isLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CircularProgress size={16} color="inherit" />
                      {loadingText}
                    </Box>
                  ) : (
                    submitButtonText
                  )
                }
                color={primaryColor}
                validation={true}
                action={formik.handleSubmit}
                disabled={isLoading || !formik.isValid}
                type="submit"
              />
            </DialogActions>
          </Box>
        </Fade>
      </StyledDialog>

      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        position={toaster.position}
        action={handleCloseToaster}
      />
    </>
  );
}