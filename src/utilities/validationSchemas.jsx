// validationSchemas.jsx
import * as Yup from 'yup';

// Full validation schema (for complete validation)
export const businessValidationSchema = Yup.object({
    businessName: Yup.string()
        .required('Business name is required')
        .min(2, 'Business name must be at least 2 characters')
        .max(100, 'Business name must be less than 100 characters')
        .trim(),
    registrationNumber: Yup.string()
        .required('Registration number is required')
        .matches(/^[A-Za-z0-9-]+$/, 'Registration number can only contain letters, numbers, and hyphens')
        .max(50, 'Registration number must be less than 50 characters')
        .trim(),
    owner: Yup.string()
        .required('Owner name is required')
        .min(2, 'Owner name must be at least 2 characters')
        .max(100, 'Owner name must be less than 100 characters')
        .trim(),
    businessType: Yup.string()
        .required('Business type is required'),
    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address must be less than 200 characters')
        .trim(),
    email: Yup.string()
        .required('Email is required')
        .email('Invalid email address')
        .max(100, 'Email must be less than 100 characters')
        .trim()
        .lowercase(),
    phone: Yup.string()
        .required('Phone number is required')
        .matches(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
        .min(6, 'Phone number must be at least 6 characters')
        .max(20, 'Phone number must be less than 20 characters')
        .trim(),
    website: Yup.string()
        .url('Invalid website URL')
        .max(200, 'Website must be less than 200 characters')
        .nullable()
        .transform((value) => value === '' ? null : value),
    description: Yup.string()
        .max(500, 'Description must be less than 500 characters')
        .nullable()
        .transform((value) => value === '' ? null : value),
    primaryColor: Yup.string()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
        .nullable()
        .transform((value) => value === '' ? null : value),
    status: Yup.string()
        .oneOf(['NEW', 'ACTIVE', 'INACTIVE'], 'Invalid status')
        .nullable()
        .transform((value) => value === '' ? null : value),
    logoFile: Yup.mixed()
        .nullable()
        .test('fileSize', 'File size must be less than 2MB', (value) => {
            if (!value) return true; // No file is valid
            return value.size <= 2 * 1024 * 1024; // 2MB
        })
        .test('fileType', 'Only JPEG, JPG, and PNG files are allowed', (value) => {
            if (!value) return true; // No file is valid
            return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type);
        })
});

// Required fields only validation (for form submission)
export const businessRequiredFieldsSchema = Yup.object({
    businessName: Yup.string().required('Business name is required'),
    registrationNumber: Yup.string().required('Registration number is required'),
    owner: Yup.string().required('Owner name is required'),
    businessType: Yup.string().required('Business type is required'),
    address: Yup.string().required('Address is required'),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    phone: Yup.string().required('Phone number is required'),
});

// Add this to your validationSchemas.jsx file
export const userValidationSchema = Yup.object({
    firstName: Yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters')
        .trim(),
    lastName: Yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters')
        .trim(),
    email: Yup.string()
        .required('Email is required')
        .email('Invalid email address')
        .max(100, 'Email must be less than 100 characters')
        .trim()
        .lowercase(),
    institutionId: Yup.string()
        .required('Business is required'),
    role: Yup.string()
        .required('Role is required'),
    username: Yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .trim(),
    phoneNumber: Yup.string()
        .required('Phone number is required')
        .matches(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
        .min(6, 'Phone number must be at least 6 characters')
        .max(20, 'Phone number must be less than 20 characters')
        .trim()
});