import React, { useState, useEffect } from "react";
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
import AppFormButton from "../../../../../components/buttons/AppFormButton";
import Toaster from "../../../../../components/Toaster";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    maxWidth: "500px",
    width: "100%",
  },
  "& .MuiBackdrop-root": {
    backdropFilter: "blur(2px)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
}));

const AnimatedBackdrop = styled(Backdrop)({
  zIndex: -1,
  position: "fixed",
  backdropFilter: "blur(3px)",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
});

// Yup validation schema for restocking
const restockValidationSchema = yup.object({
  addQuantity: yup
    .number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1')
    .integer('Quantity must be a whole number')
    .typeError('Quantity must be a valid number')
});

export default function RestockProductModal({
  show,
  product,
  onClose,
  onSave,
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

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      addQuantity: ""
    },
    validationSchema: restockValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        console.log('📦 Restocking product:', product?.name);
        console.log('➕ Adding quantity:', values.addQuantity);
        
        if (!product) {
          throw new Error('Product information is missing');
        }

        const productId = product._id || product.id;
        console.log('🔍 Product ID found:', productId);
        
        if (!productId) {
          console.log('📋 Product object structure:', Object.keys(product));
          throw new Error('Product ID is required but not found in product data');
        }

        // Calculate new stock and status
        const currentStock = product.stock || 0;
        const newStock = currentStock + parseInt(values.addQuantity);
        const threshold = product.threshold || 0;
        const newStatus = newStock >= threshold
          ? "In Stock"
          : newStock > 0
            ? "Low Stock"
            : "Out of Stock";

        // Prepare the updated product data
        const updatedProduct = {
          ...product,
          _id: productId,
          id: productId,
          stock: newStock,
          status: newStatus
        };

        console.log('🔄 Updated product data for parent:', updatedProduct);
        
        // Call the parent's save function
        await onSave(updatedProduct);
        
        // Reset form and close modal after successful save
        formik.resetForm();
        onClose();
        
      } catch (error) {
        console.error('❌ Error restocking product:', error);
        showToaster("error", "Error", error.message || "Failed to restock product");
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      formik.resetForm({ values: { addQuantity: "" } });
    }
  }, [show]);

  // Calculate preview values with safe defaults
  const currentStock = product ? (product.stock || 0) : 0;
  const addQuantity = formik.values.addQuantity === "" ? 0 : parseInt(formik.values.addQuantity) || 0;
  const newStock = currentStock + addQuantity;
  const threshold = product ? (product.threshold || 0) : 0;
  const newStatus = product ? (
    newStock >= threshold
      ? "In Stock"
      : newStock > 0
        ? "Low Stock"
        : "Out of Stock"
  ) : "Out of Stock";

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
    if (!isLoading) {
      formik.resetForm();
      onClose();
    }
  };

  if (!show || !product) return null;

  return (
    <>
      <AnimatedBackdrop open={show} transitionDuration={500} />

      <StyledDialog
        open={show}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        sx={{
          "& .MuiDialog-container": {
            backdropFilter: "blur(2px)",
          },
        }}
      >
        <Fade in={show} timeout={300}>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <DialogTitle
              sx={{
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #e0e0e0",
                padding: "20px 24px",
                fontSize: "1.25rem",
                fontWeight: "600",
              }}
            >
              Restock Product
            </DialogTitle>

            <DialogContent sx={{ padding: "24px", paddingBottom: "0" }}>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Product Information */}
                <Box>
                  <p className="mb-1">
                    <span className="text-xl font-bold text-gray-900">
                      {product.name || 'Unnamed Product'}
                    </span>
                    {product.sku && (
                      <>
                        <span className="text-gray-600 mx-2">-</span>
                        <span className="text-gray-700">SKU:</span>
                        <span className="font-semibold ml-1 text-gray-800">
                          {product.sku}
                        </span>
                      </>
                    )}
                  </p>
                  
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="font-semibold ml-1" style={{ color: primaryColor }}>
                          {currentStock}
                        </span>
                        <span className="text-gray-500 ml-1">{product.unit || 'units'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Low Stock Threshold:</span>
                        <span className="font-semibold ml-1">
                          {threshold}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Current Status:</span>
                        <span
                          className={`font-semibold ml-1 ${
                            product.status === "In Stock"
                              ? "text-green-600"
                              : product.status === "Low Stock"
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {product.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </Box>
                </Box>

                {/* Restock Input */}
                <Box>
                  <TextInput
                    id="addQuantity"
                    name="addQuantity"
                    label="Add Stock Quantity"
                    type="number"
                    input={formik.values.addQuantity}
                    handleInput={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    placeholder="Enter quantity to add"
                    required={true}
                    min="1"
                    error={formik.touched.addQuantity && Boolean(formik.errors.addQuantity)}
                    errorMessage={formik.touched.addQuantity && formik.errors.addQuantity}
                  />
                  
                  {/* Preview Section */}
                  {addQuantity > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Preview Changes:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">New Stock Level:</span>
                          <span className="font-semibold ml-1 text-green-600">
                            {newStock} {product.unit || 'units'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">New Status:</span>
                          <span
                            className={`font-semibold ml-1 ${
                              newStatus === "In Stock"
                                ? "text-green-600"
                                : newStatus === "Low Stock"
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {newStatus}
                          </span>
                        </div>
                      </div>
                      {product.status && newStatus !== product.status && (
                        <p className="text-xs text-blue-600 mt-1">
                          Status will change from <strong>{product.status}</strong> to <strong>{newStatus}</strong>
                        </p>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                paddingBottom: "35px",
                gap: "12px",
                margin: "0 30px 8px",
              }}
            >
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
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <CircularProgress size={16} color="inherit" />
                      Restocking...
                    </Box>
                  ) : (
                    "Confirm Restock"
                  )
                }
                color={primaryColor}
                validation={true}
                action={formik.handleSubmit}
                disabled={isLoading || !formik.isValid || addQuantity <= 0}
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