import { useCallback, useState } from 'react';
import { isValidEmail, validateDisplayName, validatePassword } from '../utils/firebase';

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
}

interface UseAuthValidationReturn {
  errors: ValidationErrors;
  isValid: boolean;
  validateEmail: (email: string) => boolean;
  validatePassword: (password: string) => boolean;
  validateConfirmPassword: (password: string, confirmPassword: string) => boolean;
  validateDisplayName: (name: string) => boolean;
  validateSignInForm: (email: string, password: string) => boolean;
  validateSignUpForm: (email: string, password: string, confirmPassword: string, displayName: string) => boolean;
  clearErrors: () => void;
  clearError: (field: keyof ValidationErrors) => void;
}

export const useAuthValidation = (): UseAuthValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const setError = useCallback((field: keyof ValidationErrors, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validateEmailField = useCallback((email: string): boolean => {
    if (!email) {
      setError('email', 'Email is required');
      return false;
    }

    if (!isValidEmail(email)) {
      setError('email', 'Please enter a valid email address');
      return false;
    }

    clearError('email');
    return true;
  }, [setError, clearError]);

  const validatePasswordField = useCallback((password: string): boolean => {
    if (!password) {
      setError('password', 'Password is required');
      return false;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError('password', validation.message!);
      return false;
    }

    clearError('password');
    return true;
  }, [setError, clearError]);

  const validateConfirmPasswordField = useCallback((password: string, confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setError('confirmPassword', 'Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      setError('confirmPassword', 'Passwords do not match');
      return false;
    }

    clearError('confirmPassword');
    return true;
  }, [setError, clearError]);

  const validateDisplayNameField = useCallback((name: string): boolean => {
    if (!name) {
      setError('displayName', 'Display name is required');
      return false;
    }

    const validation = validateDisplayName(name);
    if (!validation.isValid) {
      setError('displayName', validation.message!);
      return false;
    }

    clearError('displayName');
    return true;
  }, [setError, clearError]);

  const validateSignInForm = useCallback((email: string, password: string): boolean => {
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    return isEmailValid && isPasswordValid;
  }, [validateEmailField, validatePasswordField]);

  const validateSignUpForm = useCallback((
    email: string,
    password: string,
    confirmPassword: string,
    displayName: string
  ): boolean => {
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);
    const isConfirmPasswordValid = validateConfirmPasswordField(password, confirmPassword);
    const isDisplayNameValid = validateDisplayNameField(displayName);

    return isEmailValid && isPasswordValid && isConfirmPasswordValid && isDisplayNameValid;
  }, [validateEmailField, validatePasswordField, validateConfirmPasswordField, validateDisplayNameField]);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validateEmail: validateEmailField,
    validatePassword: validatePasswordField,
    validateConfirmPassword: validateConfirmPasswordField,
    validateDisplayName: validateDisplayNameField,
    validateSignInForm,
    validateSignUpForm,
    clearErrors,
    clearError,
  };
};