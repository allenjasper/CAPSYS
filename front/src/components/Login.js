import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn, Loader } from 'lucide-react';

import apiService from '../services/api';
import { setAuthData } from '../utils/auth';
import { VALIDATION, SUCCESS_MESSAGES, API_ENDPOINTS } from '../utils/constants';
import { toast } from '../components/ui/Alert';

/**
 * Modern Login Component with improved UX and validation
 */
const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Clear any existing auth data on component mount
  useEffect(() => {
    // Clear any potential auth data
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
  }, []);

  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'email':
        if (!value.trim()) {
          fieldErrors.email = 'Email is required';
        } else if (!VALIDATION.EMAIL_PATTERN.test(value)) {
          fieldErrors.email = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          fieldErrors.password = 'Password is required';
        } else if (value.length < 3) { // Relaxed for demo
          fieldErrors.password = 'Password must be at least 3 characters';
        }
        break;
      default:
        break;
    }

    return fieldErrors;
  };

  const validateForm = () => {
    const formErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      if (field !== 'rememberMe') {
        const fieldErrors = validateField(field, formData[field]);
        Object.assign(formErrors, fieldErrors);
      }
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validate field on change if it was touched
    if (touched[name]) {
      const fieldErrors = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    const fieldErrors = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please check your input and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      // Store auth data
      const authSuccess = setAuthData({
        token: response.token,
        user: response.user
      });

      if (!authSuccess) {
        throw new Error('Failed to store authentication data');
      }

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Invalid credentials') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background-primary to-background-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Login Card */}
        <div className="bg-surface rounded-2xl shadow-xl border border-border-color overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-border-color bg-gradient-to-r from-primary-color to-secondary-color">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h1 className="text-h2 font-display text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-white text-opacity-90">
                Sign in to your Unick Furniture account
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-text-muted" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`
                      form-input pl-10
                      ${errors.email ? 'form-error' : ''}
                    `}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="error-message"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-text-muted" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`
                      form-input pl-10 pr-10
                      ${errors.password ? 'form-error' : ''}
                    `}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-color transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="error-message"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="mr-2 rounded border-border-color text-primary-color focus:ring-primary-color"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-text-secondary">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-color hover:text-primary-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-text-secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-color hover:text-primary-dark font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6 p-4 bg-surface rounded-lg border border-border-color"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-2">Demo Accounts</h3>
          <div className="text-xs text-text-muted space-y-1">
            <p><strong>Admin:</strong> admin@unick.com / password</p>
            <p><strong>Customer:</strong> customer@unick.com / password</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;