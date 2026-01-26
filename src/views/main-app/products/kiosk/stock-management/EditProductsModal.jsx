import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Box,
  styled,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import TextInput from "../../../../../components/Input/TextInput";
import SelectInput from "../../../../../components/input/SelectInput";
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

export default function EditProductModal({
  show,
  product,
  onClose,
  onSave,
  onProductChange,
  categories,
}) {
  const { primaryColor } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [toaster, setToaster] = useState({
    open: false,
    state: null,
    title: "",
    message: "",
    position: "right",
  });

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        _id: product._id || product.id,
        id: product.id || product._id,
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        stock: product.stock || 0,
        unit: product.unit || 'units',
        buyingPrice: product.buyingPrice || 0,
        price: product.price || 0,
        threshold: product.threshold || 0,
        status: product.status || 'Out of Stock',
        description: product.description || '',
        kioskId: product.kioskId || '',
      });
    }
  }, [product]);

  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // Automatically update status based on stock and threshold
    if (field === 'stock' || field === 'threshold') {
      const stock = field === 'stock' ? value : formData.stock;
      const threshold = field === 'threshold' ? value : formData.threshold;
      
      if (stock === 0) {
        updatedFormData.status = 'Out of Stock';
      } else if (stock < threshold) {
        updatedFormData.status = 'Low Stock';
      } else {
        updatedFormData.status = 'In Stock';
      }
    }
    
    setFormData(updatedFormData);
    
    // Notify parent if callback exists
    if (onProductChange) {
      onProductChange(updatedFormData);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        throw new Error("Product name is required");
      }
      
      if (!formData.sku?.trim()) {
        throw new Error("SKU is required");
      }
      
      if (!formData.unit?.trim()) {
        throw new Error("Unit of measure is required");
      }
      
      if (!formData.category?.trim()) {
        throw new Error("Category is required");
      }
      
      if (formData.buyingPrice <= 0) {
        throw new Error("Buying price must be greater than 0");
      }
      
      if (formData.price <= 0) {
        throw new Error("Selling price must be greater than 0");
      }
      
      if (formData.price < formData.buyingPrice) {
        throw new Error("Selling price must be greater than or equal to buying price");
      }
      
      if (formData.stock < 0) {
        throw new Error("Stock cannot be negative");
      }
      
      if (formData.threshold < 0) {
        throw new Error("Low stock threshold cannot be negative");
      }

      console.log('📝 Saving product edit:', formData);
      
      // Call parent save function
      await onSave(formData);
      
      // Success toast will be handled by parent
      // Just close the modal
      onClose();
      
    } catch (error) {
      console.error('❌ Error in edit modal:', error);
      showToaster("error", "Validation Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      onClose();
    }
  };

  if (!show || !product || !formData._id) return null;

  const categoryOptions = categories.map((cat) => ({ 
    value: cat, 
    label: cat 
  }));

  // Add "Add New Category" option if not in list
  if (formData.category && !categories.includes(formData.category)) {
    categoryOptions.push({ 
      value: formData.category, 
      label: formData.category 
    });
  }

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
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <DialogTitle
              sx={{
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #e0e0e0",
                padding: "20px 24px",
                fontSize: "1.25rem",
                fontWeight: "600",
              }}
            >
              Edit Product
            </DialogTitle>

            <DialogContent sx={{ padding: "24px", paddingBottom: "0" }}>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Product Name and SKU */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <TextInput
                    id="edit-product-name"
                    label="Product Name"
                    value={formData.name}
                    handleInput={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                    error={!formData.name}
                    helperText={!formData.name ? "Product name is required" : ""}
                  />

                  <TextInput
                    id="edit-product-sku"
                    label="SKU"
                    value={formData.sku}
                    handleInput={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                    placeholder="Enter SKU"
                    required
                    error={!formData.sku}
                    helperText={!formData.sku ? "SKU is required" : ""}
                  />
                </Box>

                {/* Stock and Unit */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <TextInput
                    id="edit-product-stock"
                    label="Current Stock"
                    type="number"
                    value={formData.stock}
                    handleInput={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                    min="0"
                    error={formData.stock < 0}
                    helperText={formData.stock < 0 ? "Stock cannot be negative" : ""}
                  />

                  <TextInput
                    id="edit-product-unit"
                    label="Unit of Measure"
                    value={formData.unit}
                    handleInput={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="e.g., kg, pcs, l"
                    required
                    error={!formData.unit}
                    helperText={!formData.unit ? "Unit is required" : ""}
                  />
                </Box>

                {/* Prices */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <TextInput
                    id="edit-product-buying-price"
                    label="Buying Price (KES)"
                    type="number"
                    step="0.01"
                    value={formData.buyingPrice}
                    handleInput={(e) => handleInputChange('buyingPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                    min="0.01"
                    error={formData.buyingPrice <= 0}
                    helperText={formData.buyingPrice <= 0 ? "Must be greater than 0" : ""}
                  />

                  <TextInput
                    id="edit-product-selling-price"
                    label="Selling Price (KES)"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    handleInput={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                    min="0.01"
                    error={formData.price <= 0 || formData.price < formData.buyingPrice}
                    helperText={
                      formData.price <= 0 ? "Must be greater than 0" :
                      formData.price < formData.buyingPrice ? "Must be ≥ buying price" : ""
                    }
                  />
                </Box>

                {/* Threshold and Category */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <TextInput
                    id="edit-product-threshold"
                    label="Low Stock Threshold"
                    type="number"
                    value={formData.threshold}
                    handleInput={(e) => handleInputChange('threshold', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                    min="0"
                    error={formData.threshold < 0}
                    helperText={formData.threshold < 0 ? "Cannot be negative" : ""}
                  />

                  <SelectInput
                    label="Category"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                    error={!formData.category}
                    helperText={!formData.category ? "Category is required" : ""}
                  />
                </Box>

                {/* Status Display (Read-only) */}
                <Box sx={{ mt: 1 }}>
                  <div className="text-sm">
                    <span className="text-gray-600">Current Status:</span>
                    <span
                      className={`font-semibold ml-2 ${
                        formData.status === "In Stock"
                          ? "text-green-600"
                          : formData.status === "Low Stock"
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {formData.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Status updates automatically based on stock and threshold
                    </p>
                  </div>
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
                      Saving...
                    </Box>
                  ) : (
                    "Save Changes"
                  )
                }
                color={primaryColor}
                validation={true}
                action={handleSave}
                disabled={isLoading || 
                  !formData.name || 
                  !formData.sku || 
                  !formData.unit || 
                  !formData.category ||
                  formData.buyingPrice <= 0 ||
                  formData.price <= 0 ||
                  formData.price < formData.buyingPrice ||
                  formData.stock < 0 ||
                  formData.threshold < 0
                }
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