import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { getCurrentUser, isAuthenticated, isAdmin } from '../utils/auth';
import { USER_ROLES } from '../utils/constants';
import LoadingSpinner from './ui/LoadingSpinner';
import AdminDashboard from './Admin/AdminDashboard';
import CustomerDashboard from './Customers/CustomerDashboard';

/**
 * Modern Dashboard Component with role-based routing
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication and get user data
    const checkAuth = () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      setIsLoading(false);
    };

    // Small delay to allow for auth state initialization
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading dashboard..." />;
  }

  // If no user data, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background-primary"
    >
      <div className="container py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-center md:text-left">
            <h1 className="text-display-2 font-display text-text-primary mb-2">
              Welcome back, {user.name || user.username}!
            </h1>
            <p className="text-body-lg text-text-secondary">
              {getRoleBasedWelcomeMessage(user.role)}
            </p>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {renderDashboardContent(user.role)}
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Get welcome message based on user role
 */
const getRoleBasedWelcomeMessage = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'Manage your furniture business with comprehensive admin tools.';
    case USER_ROLES.EMPLOYEE:
      return 'Access production, inventory, and order management tools.';
    case USER_ROLES.CUSTOMER:
      return 'Discover our handcrafted furniture collection and manage your orders.';
    default:
      return 'Welcome to Unick Furniture management system.';
  }
};

/**
 * Render appropriate dashboard content based on user role
 */
const renderDashboardContent = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.EMPLOYEE:
      return <AdminDashboard />;
    case USER_ROLES.CUSTOMER:
      return <CustomerDashboard />;
    default:
      return (
        <div className="text-center py-12">
          <h2 className="text-h3 text-text-primary mb-4">
            Access Restricted
          </h2>
          <p className="text-body text-text-muted mb-6">
            Your account doesn't have permission to access this dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            Sign In Again
          </button>
        </div>
      );
  }
};

export default Dashboard;