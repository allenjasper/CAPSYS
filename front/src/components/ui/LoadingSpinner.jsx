import React from 'react';
import PropTypes from 'prop-types';

/**
 * Modern Loading Spinner Component
 * Provides various loading states with furniture-themed styling
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'primary', 
  text = null, 
  center = true,
  fullPage = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const variantClasses = {
    primary: 'border-primary-color',
    secondary: 'border-secondary-color', 
    white: 'border-white',
    success: 'border-success-color',
    warning: 'border-warning-color',
    error: 'border-error-color'
  };

  const spinnerClass = `
    loading-spinner
    ${sizeClasses[size]} 
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const containerClass = `
    loading-container
    ${center ? 'flex flex-col items-center justify-center' : ''}
    ${fullPage ? 'min-h-screen' : 'p-8'}
  `.trim();

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background-primary bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className={spinnerClass} {...props} />
          {text && (
            <p className="mt-4 text-text-secondary font-medium">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={spinnerClass} {...props} />
      {text && (
        <p className="mt-3 text-text-secondary text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Skeleton Loading Component for content placeholders
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  avatar = false, 
  className = '',
  width = 'full',
  height = '4'
}) => {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4', 
    '1/2': 'w-1/2',
    '1/4': 'w-1/4'
  };

  const heightClasses = {
    '2': 'h-2',
    '3': 'h-3', 
    '4': 'h-4',
    '6': 'h-6',
    '8': 'h-8',
    '12': 'h-12'
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-border-color w-12 h-12"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-border-color rounded w-1/4"></div>
            <div className="h-3 bg-border-color rounded w-1/2"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index}
            className={`
              skeleton 
              ${heightClasses[height]} 
              ${index === lines - 1 ? widthClasses['3/4'] : widthClasses[width]}
              bg-border-color rounded
            `}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Product Card Skeleton for product loading states
 */
export const ProductSkeleton = ({ count = 1, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="skeleton h-48 bg-border-color rounded-t-lg"></div>
          <div className="p-4 space-y-3">
            <div className="skeleton h-6 bg-border-color rounded w-3/4"></div>
            <div className="skeleton h-4 bg-border-color rounded w-full"></div>
            <div className="skeleton h-4 bg-border-color rounded w-2/3"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="skeleton h-6 bg-border-color rounded w-1/3"></div>
              <div className="skeleton h-8 bg-border-color rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Table Skeleton for data table loading states
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`border border-border-color rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-background-secondary p-4 border-b border-border-color">
        <div className="grid grid-cols-${columns} gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="skeleton h-4 bg-border-color rounded w-3/4"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-border-color">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 animate-pulse">
            <div className="grid grid-cols-${columns} gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="skeleton h-4 bg-border-color rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Dashboard Stats Skeleton
 */
export const StatsSkeleton = ({ count = 4, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="skeleton h-4 bg-border-color rounded w-20"></div>
                <div className="skeleton h-8 bg-border-color rounded w-16"></div>
              </div>
              <div className="skeleton h-12 w-12 bg-border-color rounded-lg"></div>
            </div>
            <div className="mt-4">
              <div className="skeleton h-3 bg-border-color rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'success', 'warning', 'error']),
  text: PropTypes.string,
  center: PropTypes.bool,
  fullPage: PropTypes.bool,
  className: PropTypes.string,
};

SkeletonLoader.propTypes = {
  lines: PropTypes.number,
  avatar: PropTypes.bool,
  className: PropTypes.string,
  width: PropTypes.oneOf(['full', '3/4', '1/2', '1/4']),
  height: PropTypes.oneOf(['2', '3', '4', '6', '8', '12']),
};

ProductSkeleton.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
  className: PropTypes.string,
};

StatsSkeleton.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingSpinner;