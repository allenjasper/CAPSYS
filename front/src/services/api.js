import axios from 'axios';
import { API_BASE_URL, ERROR_MESSAGES } from '../utils/constants';
import { getAuthHeader, handleAuthError, logout } from '../utils/auth';

/**
 * Enhanced API Service with interceptors, error handling, and security
 */
class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth headers to all requests
        const authHeaders = getAuthHeader();
        config.headers = { ...config.headers, ...authHeaders };

        // Add timestamp to prevent caching
        if (config.method === 'get') {
          config.params = { ...config.params, _t: Date.now() };
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }

        return response;
      },
      (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handle response errors with proper error messages and actions
   */
  handleResponseError(error) {
    const { response, request, message } = error;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }

    // Network error (no response)
    if (!response && request) {
      const networkError = new Error(ERROR_MESSAGES.NETWORK_ERROR);
      networkError.code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }

    // Request timeout
    if (message.includes('timeout')) {
      const timeoutError = new Error('Request timed out. Please try again.');
      timeoutError.code = 'TIMEOUT_ERROR';
      return Promise.reject(timeoutError);
    }

    if (response) {
      const { status, data } = response;
      let errorMessage = ERROR_MESSAGES.SERVER_ERROR;
      let errorCode = 'SERVER_ERROR';

      switch (status) {
        case 400:
          errorMessage = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
          errorCode = 'VALIDATION_ERROR';
          break;
        case 401:
          errorMessage = handleAuthError(error);
          errorCode = 'UNAUTHORIZED';
          break;
        case 403:
          errorMessage = ERROR_MESSAGES.FORBIDDEN;
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = ERROR_MESSAGES.NOT_FOUND;
          errorCode = 'NOT_FOUND';
          break;
        case 419:
        case 422:
          errorMessage = ERROR_MESSAGES.TOKEN_EXPIRED;
          errorCode = 'TOKEN_EXPIRED';
          // Auto logout on token expiry
          setTimeout(() => logout(), 1000);
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          errorCode = 'RATE_LIMIT';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = ERROR_MESSAGES.SERVER_ERROR;
          errorCode = 'SERVER_ERROR';
          break;
        default:
          errorMessage = data?.message || ERROR_MESSAGES.SERVER_ERROR;
          errorCode = 'UNKNOWN_ERROR';
      }

      const apiError = new Error(errorMessage);
      apiError.code = errorCode;
      apiError.status = status;
      apiError.data = data;
      
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }

  /**
   * Generic GET request
   */
  async get(url, config = {}) {
    try {
      const response = await this.api.get(url, config);
      return response.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Generic PATCH request
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete(url, config = {}) {
    try {
      const response = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(url, file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };

      const response = await this.api.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Download file
   */
  async downloadFile(url, filename = null) {
    try {
      const response = await this.api.get(url, {
        responseType: 'blob',
      });

      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Set filename from header or parameter
      const contentDisposition = response.headers['content-disposition'];
      const extractedFilename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : filename || 'download';
      
      link.setAttribute('download', extractedFilename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Cancel request
   */
  createCancelToken() {
    return axios.CancelToken.source();
  }

  /**
   * Transform error for consistent handling
   */
  transformError(error) {
    if (axios.isCancel(error)) {
      const cancelError = new Error('Request cancelled');
      cancelError.code = 'CANCELLED';
      return cancelError;
    }

    return error;
  }

  /**
   * Check if error is network error
   */
  isNetworkError(error) {
    return error.code === 'NETWORK_ERROR';
  }

  /**
   * Check if error is authentication error
   */
  isAuthError(error) {
    return ['UNAUTHORIZED', 'TOKEN_EXPIRED'].includes(error.code);
  }

  /**
   * Check if error is validation error
   */
  isValidationError(error) {
    return error.code === 'VALIDATION_ERROR';
  }

  /**
   * Retry failed request with exponential backoff
   */
  async retryRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries || this.isAuthError(error)) {
          throw error;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Batch requests
   */
  async batch(requests) {
    try {
      const responses = await Promise.allSettled(requests);
      return responses.map((response, index) => ({
        index,
        success: response.status === 'fulfilled',
        data: response.status === 'fulfilled' ? response.value : null,
        error: response.status === 'rejected' ? response.reason : null,
      }));
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Get API instance for custom requests
   */
  getInstance() {
    return this.api;
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export the main instance and the class for testing
export default apiService;
export { ApiService };

// Export convenience methods
export const {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  downloadFile,
  createCancelToken,
  retryRequest,
  batch,
  isNetworkError,
  isAuthError,
  isValidationError,
} = apiService;
