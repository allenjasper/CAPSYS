import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Modern Alert Component with auto-dismiss and icons
 */
const Alert = ({
  variant = 'info',
  title = null,
  message,
  dismissible = true,
  autoClose = false,
  duration = 5000,
  onClose = null,
  className = '',
  actions = null,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 150); // Delay to allow animation
    }
  };

  if (!isVisible) return null;

  const variantConfig = {
    success: {
      icon: CheckCircle,
      baseClass: 'alert-success',
      iconColor: 'text-success-color',
    },
    error: {
      icon: AlertCircle,
      baseClass: 'alert-error',
      iconColor: 'text-error-color',
    },
    warning: {
      icon: AlertTriangle,
      baseClass: 'alert-warning',
      iconColor: 'text-warning-color',
    },
    info: {
      icon: Info,
      baseClass: 'alert-info',
      iconColor: 'text-info-color',
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        alert 
        ${config.baseClass} 
        fade-in 
        relative 
        ${className}
      `.trim()}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        <IconComponent 
          size={20} 
          className={`${config.iconColor} flex-shrink-0 mt-0.5`}
          aria-hidden="true"
        />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm">
            {typeof message === 'string' ? (
              <p className="m-0">{message}</p>
            ) : (
              message
            )}
          </div>
          
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleClose}
            className="
              flex-shrink-0 
              p-1 
              rounded-md 
              hover:bg-black 
              hover:bg-opacity-10 
              transition-colors 
              duration-200
              focus:outline-none 
              focus:ring-2 
              focus:ring-primary-color
            "
            aria-label="Close alert"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {autoClose && duration > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-shrink"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

/**
 * Toast Notification Component
 */
export const Toast = ({
  variant = 'info',
  title = null,
  message,
  position = 'top-right',
  duration = 4000,
  onClose = null,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Enter animation
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div
      className={`
        fixed 
        ${positionClasses[position]} 
        z-50 
        max-w-sm 
        w-full 
        mx-4
        transform 
        transition-all 
        duration-300 
        ease-in-out
        ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      <Alert
        variant={variant}
        title={title}
        message={message}
        dismissible={true}
        onClose={handleClose}
        className={`shadow-lg ${className}`}
        {...props}
      />
    </div>
  );
};

/**
 * Banner Alert Component for page-wide notifications
 */
export const Banner = ({
  variant = 'info',
  message,
  dismissible = true,
  onClose = null,
  className = '',
  centered = false,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      <Alert
        variant={variant}
        message={message}
        dismissible={dismissible}
        onClose={onClose}
        className={`
          rounded-none 
          border-x-0 
          ${centered ? 'text-center' : ''}
        `}
        {...props}
      />
    </div>
  );
};

/**
 * Inline Alert Component for form validation
 */
export const InlineAlert = ({
  variant = 'error',
  message,
  className = '',
  ...props
}) => {
  if (!message) return null;

  return (
    <Alert
      variant={variant}
      message={message}
      dismissible={false}
      className={`mt-2 text-xs ${className}`}
      {...props}
    />
  );
};

/**
 * Toast Notification Manager
 */
class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  show(toast) {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    
    this.toasts.push(newToast);
    this.notifyListeners();

    return id;
  }

  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }

  // Convenience methods
  success(message, options = {}) {
    return this.show({ variant: 'success', message, ...options });
  }

  error(message, options = {}) {
    return this.show({ variant: 'error', message, ...options });
  }

  warning(message, options = {}) {
    return this.show({ variant: 'warning', message, ...options });
  }

  info(message, options = {}) {
    return this.show({ variant: 'info', message, ...options });
  }
}

// Create singleton instance
export const toast = new ToastManager();

/**
 * Toast Container Component
 */
export const ToastContainer = ({ position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const displayedToasts = toasts.slice(-maxToasts);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className={`absolute ${getContainerPosition(position)} space-y-2`}>
        {displayedToasts.map((toastItem) => (
          <div key={toastItem.id} className="pointer-events-auto">
            <Toast
              {...toastItem}
              onClose={() => toast.remove(toastItem.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

function getContainerPosition(position) {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };
  return positions[position] || positions['top-right'];
}

// PropTypes
Alert.propTypes = {
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  dismissible: PropTypes.bool,
  autoClose: PropTypes.bool,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  className: PropTypes.string,
  actions: PropTypes.node,
};

Toast.propTypes = {
  ...Alert.propTypes,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
};

Banner.propTypes = {
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  centered: PropTypes.bool,
};

InlineAlert.propTypes = {
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string,
  className: PropTypes.string,
};

ToastContainer.propTypes = {
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
  maxToasts: PropTypes.number,
};

export default Alert;