import React, { useState, useMemo, useRef } from "react";
import { Dialog, Fade, styled, Switch, CircularProgress, Box } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { Upload, Trash2, Image as ImageIcon, X } from "lucide-react";
import TextInput from "../../../../../components/Input/TextInput";
import SelectInput from "../../../../../components/Input/SelectInput";
import TextBoxInput from "../../../../../components/Input/TextBoxInput";
import AppFormButton from "../../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    maxWidth: "500px",
    width: "100%",
    margin: "16px",
  },
  "& .MuiBackdrop-root": {
    backdropFilter: "blur(1px)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
}));

const DEFAULT_CATEGORIES = [
  "Breakfast", "Mains", "Sides", "Beverages", "Desserts", "Snacks",
];

// Resize/compress the selected image client-side and return a compact data URL.
// Keeps stored images small (~30-60KB) since they live in the product record.
const resizeImage = (file, maxDim = 500) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

const menuValidationSchema = yup.object({
  name: yup
    .string()
    .required("Item name is required")
    .min(2, "Item name must be at least 2 characters")
    .max(100, "Item name must be less than 100 characters"),
  category: yup.string().required("Category is required"),
  price: yup
    .number()
    .required("Price is required")
    .min(1, "Price must be greater than 0")
    .typeError("Price must be a valid number"),
  description: yup
    .string()
    .required("Description is required")
    .max(200, "Description must be less than 200 characters"),
});

export default function MenuFormModal({
  show,
  mode = "add",
  item = null,
  onClose,
  onSave,
  categories = [],
  errorMessage,
}) {
  const { primaryColor } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const modalTitle = mode === "edit" ? "Edit menu item" : "Add menu item";
  const submitButtonText = mode === "edit" ? "Save changes" : "Add item";
  const loadingText = mode === "edit" ? "Saving..." : "Adding...";

  const initialValues = useMemo(() => {
    if (mode === "edit" && item) {
      return {
        _id: item._id || item.id || "",
        name: String(item.name || "").trim(),
        category: String(item.category || ""),
        price: Number(item.price) || "",
        description: String(item.description || ""),
        available: item.available !== false,
        image: item.image || "",
      };
    }
    return {
      _id: "",
      name: "",
      category: "",
      price: "",
      description: "",
      available: true,
      image: "",
    };
  }, [item, mode]);

  const formik = useFormik({
    initialValues,
    validationSchema: menuValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const itemData = {
          name: String(values.name || "").trim(),
          category: String(values.category || "").trim(),
          price: Number.parseFloat(values.price) || 0,
          description: String(values.description || "").trim(),
          available: !!values.available,
          image: values.image || "",
        };
        if (mode === "edit" && values._id) itemData._id = values._id;
        await onSave(itemData);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be smaller than 5MB");
      return;
    }
    setImageError("");
    try {
      const dataUrl = await resizeImage(file);
      formik.setFieldValue("image", dataUrl);
    } catch {
      setImageError("Could not process that image, try another one");
    }
  };

  const allCategories = useMemo(() => {
    const options = DEFAULT_CATEGORIES.map((c) => ({ value: c, label: c }));
    (categories || []).forEach((cat) => {
      if (cat && !options.some((opt) => opt.value === cat)) {
        options.push({ value: cat, label: cat });
      }
    });
    if (formik.values.category && !options.some((opt) => opt.value === formik.values.category)) {
      options.push({ value: formik.values.category, label: formik.values.category });
    }
    return options;
  }, [categories, formik.values.category]);

  const handleClose = () => {
    formik.resetForm();
    setImageError("");
    onClose();
  };

  if (!show) return null;

  return (
    <StyledDialog open={show} onClose={handleClose} closeAfterTransition>
      <Fade in={show} timeout={300}>
        <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">{modalTitle}</h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 mb-4">
                {errorMessage}
              </div>
            )}

            {/* Image upload */}
            <div className="mb-4">
              <div className="mb-1">
                <span className="text-[14px] leading-4 font-bold text-[#353f50]">
                  Item image
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-orange-50 flex items-center justify-center shrink-0">
                  {formik.values.image ? (
                    <img
                      src={formik.values.image}
                      alt="Menu item"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={22} className="text-orange-300" />
                  )}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Upload size={14} />
                      {formik.values.image ? "Change" : "Upload"}
                    </button>
                    {formik.values.image && (
                      <button
                        type="button"
                        onClick={() => formik.setFieldValue("image", "")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Optional — JPG/PNG up to 5MB</p>
                  {imageError && <p className="text-xs text-red-500">{imageError}</p>}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            {/* Name */}
            <TextInput
              id="name"
              name="name"
              label="Item name"
              placeholder="e.g. Pilau Beef"
              required
              input={formik.values.name}
              handleInput={formik.handleChange}
              handleBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              errorMessage={formik.touched.name && formik.errors.name}
            />

            {/* Category + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                id="category"
                name="category"
                label="Category"
                options={allCategories}
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                error={formik.touched.category && Boolean(formik.errors.category)}
                errorMessage={formik.touched.category && formik.errors.category}
              />

              <TextInput
                id="price"
                name="price"
                label="Price (KSh)"
                type="number"
                placeholder="0"
                required
                input={formik.values.price}
                handleInput={formik.handleChange}
                handleBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                errorMessage={formik.touched.price && formik.errors.price}
              />
            </div>

            {/* Description */}
            <TextBoxInput
              id="description"
              label="Description"
              placeholder="Short description shown on the menu..."
              required
              max={200}
              input={formik.values.description}
              handleInput={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              errorMessage={formik.touched.description && formik.errors.description}
            />

            {/* Availability */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {formik.values.available ? "Available on menu" : "Not available"}
                </p>
                <p className="text-xs text-gray-400">
                  Waiters only see available items on Create order
                </p>
              </div>
              <Switch
                name="available"
                checked={formik.values.available}
                onChange={formik.handleChange}
                color="success"
              />
            </div>
          </div>

          {/* Footer — buttons split 50/50 */}
          <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
            <div className="w-1/2">
              <AppFormButton
                text="Cancel"
                color="invert"
                action={handleClose}
                validation={!isLoading}
              />
            </div>
            <div className="w-1/2">
              <AppFormButton
                text={
                  isLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CircularProgress size={15} color="inherit" />
                      {loadingText}
                    </Box>
                  ) : (
                    submitButtonText
                  )
                }
                color={primaryColor}
                isLoading={isLoading}
                validation={!isLoading}
                action={formik.handleSubmit}
              />
            </div>
          </div>
        </form>
      </Fade>
    </StyledDialog>
  );
}
