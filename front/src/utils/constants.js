// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  
  // Cart
  CART: '/cart',
  CART_ITEM: (id) => `/cart/${id}`,
  CHECKOUT: '/checkout',
  
  // Orders
  ORDERS: '/orders',
  MY_ORDERS: '/my-orders',
  ORDER_COMPLETE: (id) => `/orders/${id}/complete`,
  
  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_ITEM: (id) => `/inventory/${id}`,
  
  // Production
  PRODUCTIONS: '/productions',
  PRODUCTION_ITEM: (id) => `/productions/${id}`,
  
  // Reports
  REPORTS: '/reports',
  STOCK_PREDICTION: '/predict/stock',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USERNAME: 'username',
  ROLE: 'role',
  USER_ID: 'user_id',
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  CHAIRS: 'chairs',
  TABLES: 'tables',
  SOFAS: 'sofas',
  BEDS: 'beds',
  STORAGE: 'storage',
  DECOR: 'decor',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Form Validation
export const VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  PHONE_PATTERN: /^\+?[\d\s\-()]+$/,
};

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  PAGINATION_SIZE: 12,
  CART_REFRESH_INTERVAL: 5000,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden. Please contact support.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  LOGIN_FAILED: 'Invalid email or password.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PRODUCT_ADDED: 'Product added successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  CART_UPDATED: 'Cart updated successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Furniture Wood Types
export const WOOD_TYPES = {
  OAK: 'Oak',
  PINE: 'Pine',
  MAHOGANY: 'Mahogany',
  CHERRY: 'Cherry',
  WALNUT: 'Walnut',
  MAPLE: 'Maple',
  BIRCH: 'Birch',
  TEAK: 'Teak',
};

// Material Types for Inventory
export const MATERIAL_TYPES = {
  WOOD: 'wood',
  METAL: 'metal',
  FABRIC: 'fabric',
  LEATHER: 'leather',
  HARDWARE: 'hardware',
  GLASS: 'glass',
  FOAM: 'foam',
  ADHESIVE: 'adhesive',
};

// Production Units
export const PRODUCTION_UNITS = {
  PIECES: 'pieces',
  SETS: 'sets',
  SQUARE_METERS: 'sqm',
  LINEAR_METERS: 'lm',
  KILOGRAMS: 'kg',
  LITERS: 'l',
};

// Chart Colors for Dashboard
export const CHART_COLORS = {
  PRIMARY: '#8B4513',
  SECONDARY: '#D2691E',
  SUCCESS: '#27AE60',
  WARNING: '#F39C12',
  ERROR: '#E74C3C',
  INFO: '#3498DB',
  ACCENT: '#DEB887',
  GRADIENT: [
    '#8B4513',
    '#A0522D',
    '#CD853F',
    '#D2691E',
    '#DEB887',
    '#F4A460',
    '#DDBF94',
    '#C8A882',
  ],
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
};

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES: 5,
};

const constants = {
  API_BASE_URL,
  API_ENDPOINTS,
  USER_ROLES,
  STORAGE_KEYS,
  PRODUCT_CATEGORIES,
  ORDER_STATUS,
  VALIDATION,
  UI_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WOOD_TYPES,
  MATERIAL_TYPES,
  PRODUCTION_UNITS,
  CHART_COLORS,
  BREAKPOINTS,
  ANIMATIONS,
  FILE_UPLOAD,
};

export default constants;