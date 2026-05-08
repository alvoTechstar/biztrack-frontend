// validationSchemas.jsx
import * as Yup from 'yup';

// Full validation schema (for complete validation)
export const businessValidationSchema = Yup.object({
    businessName: Yup.string()
        .required('Business name is required')
        .min(2, 'Business name must be at least 2 characters')
        .max(100, 'Business name must be at most 100 characters'),

    registrationNumber: Yup.string()
        .required('Registration number is required')
        .matches(/^[A-Za-z0-9-]+$/, 'Registration number can only contain letters, numbers, and hyphens'),

    address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters'),

    businessType: Yup.string()
        .required('Business type is required'),

    email: Yup.string()
        .required('Email is required')
        .email('Invalid email format'),

    phone: Yup.string()
        .required('Phone number is required')
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/, 'Invalid phone number format'),

    owner: Yup.string()
        .required('Owner name is required')
        .min(2, 'Owner name must be at least 2 characters'),

    website: Yup.string()
        .url('Invalid website URL')
        .nullable(),

    description: Yup.string()
        .max(500, 'Description must be at most 500 characters')
        .nullable(),

    primaryColor: Yup.string()
        .required('Primary color is required')
        .matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),

    status: Yup.string()
        .oneOf(['NEW', 'ACTIVE', 'INACTIVE'], 'Invalid status'),

    // Payment fields validation
    paymentType: Yup.string()
        .required('Payment type is required')
        .oneOf(['TILL', 'PAYBILL', 'POCHI'], 'Invalid payment type'),

    tillNumber: Yup.string()
        .when('paymentType', {
            is: 'TILL',
            then: (schema) => schema
                .required('Till number is required')
                .matches(/^\d{5,10}$/, 'Till number must be 5-10 digits'),
            otherwise: (schema) => schema.notRequired()
        }),

    paybillNumber: Yup.string()
        .when('paymentType', {
            is: 'PAYBILL',
            then: (schema) => schema
                .required('Paybill number is required')
                .matches(/^\d{5,7}$/, 'Paybill number must be 5-7 digits'),
            otherwise: (schema) => schema.notRequired()
        }),

    accountNumber: Yup.string()
        .when('paymentType', {
            is: 'PAYBILL',
            then: (schema) => schema
                .required('Account number is required')
                .max(50, 'Account number must be at most 50 characters'),
            otherwise: (schema) => schema.notRequired()
        }),

    pochiNumber: Yup.string()
        .when('paymentType', {
            is: 'POCHI',
            then: (schema) => schema
                .required('Pochi number is required')
                .test('pochiPhone', 'Invalid Pochi number format. Use: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, or 7XXXXXXXX', (value) => {
                    if (!value) return false;

                    // Remove all non-digit characters
                    const cleaned = value.toString().replace(/\D/g, '');

                    // Check various valid formats
                    const isValid =
                        // 07XXXXXXXX (10 digits starting with 07)
                        /^07\d{8}$/.test(cleaned) ||
                        // 01XXXXXXXX (10 digits starting with 01)
                        /^01\d{8}$/.test(cleaned) ||
                        // 2547XXXXXXXX (12 digits starting with 2547)
                        /^2547\d{8}$/.test(cleaned) ||
                        // 7XXXXXXXX (9 digits starting with 7)
                        /^7\d{8}$/.test(cleaned);

                    return isValid;
                })
                .transform((value) => {
                    if (!value) return value;

                    // Clean the number and convert to 254 format for consistency
                    let cleaned = value.toString().replace(/\D/g, '');

                    if (cleaned.startsWith('0')) {
                        // 07XXXXXXXX or 01XXXXXXXX → 2547XXXXXXXX or 2541XXXXXXXX
                        cleaned = '254' + cleaned.substring(1);
                    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
                        // 7XXXXXXXX → 2547XXXXXXXX
                        cleaned = '254' + cleaned;
                    } else if (cleaned.startsWith('1') && cleaned.length === 9) {
                        // 1XXXXXXXX → 2541XXXXXXXX
                        cleaned = '254' + cleaned;
                    }
                    // 2547XXXXXXXX or 2541XXXXXXXX already in correct format

                    return cleaned;
                }),
            otherwise: (schema) => schema.notRequired()
        }),

    logoFile: Yup.mixed()
        .nullable()
        .test('fileSize', 'File too large (max 5MB)', (value) => {
            if (!value) return true;
            return value.size <= 5 * 1024 * 1024;
        })
        .test('fileType', 'Unsupported file format', (value) => {
            if (!value) return true;
            return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type);
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