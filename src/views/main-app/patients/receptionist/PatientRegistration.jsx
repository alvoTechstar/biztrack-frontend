// src/PatientRegistration.jsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";

import AppFormButton from "../../../../components/buttons/AppFormButton";
import TextInput from "../../../../components/Input/TextInput";
import SelectInput from "../../../../components/Input/SelectInput";
import { useTheme } from "../../../../components/theme/ThemeContext";
import DateInput from "../../../../components/input/DateInput";

// ───────────────────────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────────────────────
const GENDER_OPTIONS = ["Male", "Female"];
const VISIT_TYPES = [
  "Consultation",
  "Emergency",
  "Follow-up",
  "Dental Checkup",
  "Vaccination",
];

// ───────────────────────────────────────────────────────────────────────────────
const PatientRegistration = ({
  isOpen,
  onClose,
  onRegisterPatient,
  patients = [],
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    nationalId: "",
    gender: "",
    dob: null,
    address: "",
    visitType: VISIT_TYPES[0],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState({});

  const { primaryColor: PrimaryColor } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: "",
        phoneNumber: "",
        nationalId: "",
        gender: "",
        dob: null,
        address: "",
        visitType: VISIT_TYPES[0],
      });
      setErrors({});
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setSuccessMessage("");
    setErrorMessage("");
  };
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Re-run validation on blur for that field
    validateField(name);
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dob: date }));
    setErrors((prev) => ({ ...prev, dob: "" }));
  };
  const validateField = (name) => {
    const value = formData[name];
    let message = "";

    if (name === "fullName" && !value.trim()) {
      message = "Full name is required.";
    }

    if (name === "phoneNumber") {
      if (!value.trim()) {
        message = "Phone number is required.";
      } else if (!/^\+?\d{7,15}$/.test(value.trim())) {
        message = "Invalid phone number format.";
      } else if (patients.some((p) => p.phoneNumber === value.trim())) {
        message = "Phone number already registered.";
      }
    }

    if (name === "nationalId") {
      if (!value.trim()) {
        message = "National ID is required.";
      } else if (patients.some((p) => p.nationalId === value.trim())) {
        message = "National ID already registered.";
      }
    }

    if (name === "gender" && !value) {
      message = "Gender is required.";
    }

    if (name === "dob" && !formData.dob) {
      message = "Date of birth is required.";
    }

    if (name === "address" && !value.trim()) {
      message = "Address is required.";
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validate = () => {
    const tmp = {};

    if (!formData.fullName.trim()) tmp.fullName = "Full name is required.";
    if (!formData.phoneNumber.trim()) {
      tmp.phoneNumber = "Phone number is required.";
    } else if (!/^\+?\d{7,15}$/.test(formData.phoneNumber.trim())) {
      tmp.phoneNumber = "Invalid phone number format.";
    } else if (
      patients.some((p) => p.phoneNumber === formData.phoneNumber.trim())
    ) {
      tmp.phoneNumber = "Phone number already registered.";
    }

    if (!formData.nationalId.trim()) {
      tmp.nationalId = "National ID is required.";
    } else if (
      patients.some((p) => p.nationalId === formData.nationalId.trim())
    ) {
      tmp.nationalId = "National ID already registered.";
    }

    if (!formData.gender) tmp.gender = "Gender is required.";
    if (!formData.dob) tmp.dob = "Date of birth is required.";
    if (!formData.address.trim()) tmp.address = "Address is required.";

    setErrors(tmp);
    return Object.keys(tmp).length === 0;
  };
  useEffect(() => {
    const isValid = validate();
    setIsFormValid(isValid);
  }, [formData]);

  const handleSubmit = async () => {
    setTouched({
      fullName: true,
      phoneNumber: true,
      nationalId: true,
      gender: true,
      dob: true,
      address: true,
      visitType: true,
    });

    setSuccessMessage("");
    setErrorMessage("");

    if (!validate()) {
      setErrorMessage("Please correct the errors in the form.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDob = formData.dob
        ? format(formData.dob, "yyyy-MM-dd")
        : null;
      await onRegisterPatient({ ...formData, dob: formattedDob });
      setSuccessMessage("Patient registered and added to queue ✓");
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to register patient. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsFormValid(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <Paper
        elevation={3}
        sx={{
          width: {
            xs: "calc(100% - 32px)",
            sm: "500px",
            md: "600px",
            lg: "75%",
          },
          maxWidth: "calc(100% - 100px)",
          mx: "auto",
          my: "auto",
          p: 3,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Register New Patient</h2>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              backgroundColor: PrimaryColor,
              color: "white",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: PrimaryColor,
                opacity: 0.9,
              },
              p: "6px",
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>

        {/* Alerts */}
        {successMessage && (
          <Alert severity="success" className="mb-4">
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" className="mb-4">
            {errorMessage}
          </Alert>
        )}

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <TextInput
            label="Full Name"
            name="fullName"
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={handleChange}
            size="small"
            onBlur={handleBlur}
            error={touched.fullName && !!errors.fullName}
            errorMessage={touched.fullName && errors.fullName}
            required
          />
          <TextInput
            label="Phone Number"
            name="phoneNumber"
            placeholder="e.g. 0719515125"
            value={formData.phoneNumber}
            onChange={handleChange}
            size="small"
            onBlur={handleBlur}
            error={touched.phoneNumber && !!errors.phoneNumber}
            errorMessage={touched.phoneNumber && errors.phoneNumber}
            required
            type="tel"
          />
          <TextInput
            label="National ID"
            name="nationalId"
            placeholder="e.g. 12345678"
            value={formData.nationalId}
            onChange={handleChange}
            size="small"
            onBlur={handleBlur}
            error={touched.nationalId && !!errors.nationalId}
            errorMessage={touched.nationalId && errors.nationalId}
            required
          />

          <DateInput
            label="Date of Birth"
            name="dob"
            value={formData.dob}
            onChange={handleDateChange}
            size="small"
            onBlur={handleBlur}
            error={touched.dob && !!errors.dob}
            errorMessage={touched.dob && errors.dob}
            required
          />

          <TextInput
            label="Address"
            name="address"
            placeholder="e.g. 123 Main St, Nairobi"
            value={formData.address}
            onChange={handleChange}
            size="small"
            onBlur={handleBlur}
            error={touched.address && !!errors.address}
            errorMessage={touched.address && errors.address}
            required
          />

          <SelectInput
            id="visit-type"
            name="visitType"
            label="Visit Type"
            options={VISIT_TYPES.map((t) => ({ label: t, value: t }))}
            value={formData.visitType}
            onChange={handleChange}
            required
            size="small"
            onBlur={handleBlur}
            error={touched.visitType && !!errors.visitType}
            errorMessage={touched.visitType && errors.visitType}
          />

          {/* Gender */}
          <div className="lg:col-span-1 flex items-center">
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              className="flex flex-wrap gap-4"
            >
              {GENDER_OPTIONS.map((g) => (
                <FormControlLabel
                  key={g}
                  value={g}
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": {
                          color: PrimaryColor,
                        },
                      }}
                    />
                  }
                  label={g}
                />
              ))}
            </RadioGroup>
          </div>

          {/* Empty divs to align layout */}
          <div className="hidden lg:block lg:col-span-1" />
          <div className="hidden lg:block lg:col-span-1" />

          {/* Submit */}
          <div className="hidden lg:block lg:col-span-1" />
          <div className="lg:col-span-1 flex justify-start lg:justify-end pt-4">
            <AppFormButton
              text="Register Patient"
              color={PrimaryColor}
              action={handleSubmit}
              isLoading={isSubmitting}
              validation={!isSubmitting}
              disabled={!isFormValid}
            />
          </div>
          <div className="hidden lg:block lg:col-span-1" />
        </form>
      </Paper>
    </div>
  );
};

export default PatientRegistration;
