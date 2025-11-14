import { APP_CONSTANTS } from './config';

// CNIC Validation
export const validateCNIC = (cnic) => {
  if (!cnic) {
    return { valid: false, message: 'CNIC is required' };
  }

  // Remove dashes and spaces
  const cleanCNIC = cnic.replace(/[-\s]/g, '');

  if (cleanCNIC.length !== APP_CONSTANTS.CNIC_LENGTH) {
    return { valid: false, message: `CNIC must be ${APP_CONSTANTS.CNIC_LENGTH} digits` };
  }

  if (!/^\d+$/.test(cleanCNIC)) {
    return { valid: false, message: 'CNIC must contain only digits' };
  }

  return { valid: true, message: '', cleanCNIC };
};

// Format CNIC with dashes
export const formatCNIC = (cnic) => {
  if (!cnic) return '';
  const cleaned = cnic.replace(/[-\s]/g, '');
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
};

// Phone Number Validation
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }

  // Remove spaces, dashes, and country code
  const cleanPhone = phone.replace(/[\s-+]/g, '').replace(/^92/, '0');

  if (cleanPhone.length !== APP_CONSTANTS.PHONE_LENGTH) {
    return { valid: false, message: `Phone number must be ${APP_CONSTANTS.PHONE_LENGTH} digits` };
  }

  if (!/^03\d{9}$/.test(cleanPhone)) {
    return { valid: false, message: 'Phone number must start with 03' };
  }

  return { valid: true, message: '', cleanPhone };
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s-+]/g, '').replace(/^92/, '0');
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
};

// Email Validation
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  return { valid: true, message: '' };
};

// Amount Validation
export const validateAmount = (amount, min = 0, max = Infinity) => {
  if (!amount || amount === '') {
    return { valid: false, message: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return { valid: false, message: 'Amount must be a number' };
  }

  if (numAmount < min) {
    return { valid: false, message: `Amount must be at least PKR ${min.toLocaleString()}` };
  }

  if (numAmount > max) {
    return { valid: false, message: `Amount cannot exceed PKR ${max.toLocaleString()}` };
  }

  return { valid: true, message: '' };
};

// Format currency
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return `PKR ${parseFloat(amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Date Validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return { valid: false, message: `${fieldName} is required` };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: `Invalid ${fieldName.toLowerCase()}` };
  }

  return { valid: true, message: '' };
};

// Age Validation (for DOB)
export const validateAge = (dob, minAge = 18, maxAge = 70) => {
  if (!dob) {
    return { valid: false, message: 'Date of birth is required' };
  }

  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < minAge) {
    return { valid: false, message: `You must be at least ${minAge} years old` };
  }

  if (age > maxAge) {
    return { valid: false, message: `Maximum age is ${maxAge} years` };
  }

  return { valid: true, message: '', age };
};

// Required Field Validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

// Text Length Validation
export const validateLength = (text, minLength = 0, maxLength = Infinity, fieldName = 'This field') => {
  if (!text) {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (text.length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }

  if (text.length > maxLength) {
    return { valid: false, message: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  return { valid: true, message: '' };
};

// Validate entire form
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];

    if (rules.required) {
      const result = validateRequired(value, rules.label || field);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
        return;
      }
    }

    if (rules.type === 'cnic') {
      const result = validateCNIC(value);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rules.type === 'phone') {
      const result = validatePhoneNumber(value);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rules.type === 'email') {
      const result = validateEmail(value);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rules.type === 'amount') {
      const result = validateAmount(value, rules.min, rules.max);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    if (rules.minLength || rules.maxLength) {
      const result = validateLength(value, rules.minLength || 0, rules.maxLength || Infinity, rules.label || field);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Document Validation
export const validateDocument = (document) => {
  if (!document) {
    return { valid: false, message: 'No document selected' };
  }

  // Check file size
  if (document.size && document.size > APP_CONSTANTS.MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      message: `File size exceeds ${APP_CONSTANTS.MAX_DOCUMENT_SIZE / (1024 * 1024)} MB limit`,
    };
  }

  // Check file type
  if (document.type && !APP_CONSTANTS.ALLOWED_DOCUMENT_TYPES.includes(document.type)) {
    return {
      valid: false,
      message: 'Invalid file type. Only JPEG, PNG, and PDF are allowed',
    };
  }

  return { valid: true, message: '' };
};

