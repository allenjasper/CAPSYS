import { STORAGE_KEYS, USER_ROLES, ERROR_MESSAGES } from './constants';

/**
 * Authentication Utility Class
 * Handles all authentication-related operations with improved security
 */
class AuthService {
  constructor() {
    this.listeners = new Set();
    this.initializeTokenRefresh();
  }

  /**
   * Initialize automatic token refresh
   */
  initializeTokenRefresh() {
    // Check token validity every 5 minutes
    setInterval(() => {
      if (this.isAuthenticated() && this.isTokenExpiringSoon()) {
        this.refreshToken();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Store authentication data securely
   */
  setAuthData({ token, user }) {
    try {
      if (!token || !user) {
        throw new Error('Invalid auth data');
      }

      // Store token with timestamp for expiry checking
      const authData = {
        token,
        timestamp: Date.now(),
        expiresIn: 24 * 60 * 60 * 1000, // 24 hours
      };

      localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(authData));
      localStorage.setItem(STORAGE_KEYS.USERNAME, user.name || user.username);
      localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
      localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);

      // Notify listeners of auth state change
      this.notifyListeners({ isAuthenticated: true, user });
      
      return true;
    } catch (error) {
      console.error('Error storing auth data:', error);
      return false;
    }
  }

  /**
   * Get stored token
   */
  getToken() {
    try {
      const tokenData = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!tokenData) return null;

      const { token, timestamp, expiresIn } = JSON.parse(tokenData);
      
      // Check if token is expired
      if (Date.now() - timestamp > expiresIn) {
        this.clearAuthData();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    try {
      const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
      const role = localStorage.getItem(STORAGE_KEYS.ROLE);
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

      if (!username || !role) return null;

      return {
        id: userId,
        username,
        name: username,
        role,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Check if token is expiring soon (within 1 hour)
   */
  isTokenExpiringSoon() {
    try {
      const tokenData = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!tokenData) return false;

      const { timestamp, expiresIn } = JSON.parse(tokenData);
      const timeLeft = expiresIn - (Date.now() - timestamp);
      
      // Return true if less than 1 hour left
      return timeLeft < 60 * 60 * 1000;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  }

  /**
   * Check if user is admin/employee
   */
  isAdmin() {
    return this.hasRole([USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);
  }

  /**
   * Check if user is customer
   */
  isCustomer() {
    return this.hasRole(USER_ROLES.CUSTOMER);
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);

      // Notify listeners of auth state change
      this.notifyListeners({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.clearAuthData();
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader() {
    const token = this.getToken();
    if (!token) return {};

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Refresh token (placeholder for future implementation)
   */
  async refreshToken() {
    // TODO: Implement token refresh logic with backend
    console.log('Token refresh needed');
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error) {
    const status = error.response?.status;
    
    switch (status) {
      case 401:
        this.clearAuthData();
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 419:
      case 422:
        this.clearAuthData();
        return ERROR_MESSAGES.TOKEN_EXPIRED;
      default:
        return ERROR_MESSAGES.NETWORK_ERROR;
    }
  }

  /**
   * Add listener for auth state changes
   */
  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of auth state changes
   */
  notifyListeners(authState) {
    this.listeners.forEach(callback => {
      try {
        callback(authState);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  /**
   * Validate user permissions for route access
   */
  canAccessRoute(routeRole) {
    if (!routeRole) return true; // Public route
    
    if (!this.isAuthenticated()) return false;
    
    return this.hasRole(routeRole);
  }

  /**
   * Format user display name
   */
  getDisplayName() {
    const user = this.getCurrentUser();
    if (!user) return 'Guest';
    
    return user.name || user.username || 'User';
  }

  /**
   * Get user role display name
   */
  getRoleDisplayName() {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return 'Administrator';
      case USER_ROLES.EMPLOYEE:
        return 'Employee';
      case USER_ROLES.CUSTOMER:
        return 'Customer';
      default:
        return user.role;
    }
  }

  /**
   * Check if the user session is valid
   */
  validateSession() {
    if (!this.isAuthenticated()) {
      this.clearAuthData();
      return false;
    }
    
    return true;
  }

  /**
   * Security: Clear sensitive data on page unload
   */
  setupSecurityListeners() {
    // Clear sensitive data when tab is closed
    window.addEventListener('beforeunload', () => {
      // Only clear if user hasn't explicitly stayed logged in
      const rememberMe = localStorage.getItem('rememberMe');
      if (!rememberMe) {
        this.clearAuthData();
      }
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is hidden - could implement additional security measures
        return;
      } else {
        // Tab is visible - validate session
        this.validateSession();
      }
    });
  }
}

// Create singleton instance
const authService = new AuthService();

// Setup security listeners
authService.setupSecurityListeners();

// Utility functions for convenience
export const getToken = () => authService.getToken();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const hasRole = (role) => authService.hasRole(role);
export const isAdmin = () => authService.isAdmin();
export const isCustomer = () => authService.isCustomer();
export const logout = () => authService.logout();
export const getAuthHeader = () => authService.getAuthHeader();
export const setAuthData = (data) => authService.setAuthData(data);
export const clearAuthData = () => authService.clearAuthData();
export const handleAuthError = (error) => authService.handleAuthError(error);
export const addAuthListener = (callback) => authService.addListener(callback);
export const canAccessRoute = (role) => authService.canAccessRoute(role);
export const getDisplayName = () => authService.getDisplayName();
export const getRoleDisplayName = () => authService.getRoleDisplayName();

export default authService;