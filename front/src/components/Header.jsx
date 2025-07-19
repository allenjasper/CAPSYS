import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LayoutDashboard,
  Package,
  ClipboardList,
  Boxes,
  Factory,
  BarChart,
  LogOut,
  Settings,
  Bell,
  Search,
  Home,
} from 'lucide-react';

import { getCurrentUser, isAuthenticated, logout, isAdmin, getDisplayName } from '../utils/auth';
import { USER_ROLES } from '../utils/constants';
import apiService from '../services/api';

/**
 * Modern Header Component with responsive navigation and user management
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const isUserAdmin = isAdmin();

  // Fetch cart count for customers
  useEffect(() => {
    if (authenticated && user?.role === USER_ROLES.CUSTOMER) {
      fetchCartCount();
      // Set interval to refresh cart count
      const interval = setInterval(fetchCartCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [authenticated, user]);

  const fetchCartCount = async () => {
    try {
      const cartData = await apiService.get('/cart');
      const totalItems = Array.isArray(cartData) 
        ? cartData.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 0;
      setCartCount(totalItems);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!authenticated) return [];

    const baseItems = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        active: location.pathname === '/dashboard',
      },
    ];

    if (isUserAdmin) {
      return [
        ...baseItems,
        {
          label: 'Products',
          path: '/product',
          icon: Package,
          active: location.pathname === '/product',
        },
        {
          label: 'Orders',
          path: '/orders',
          icon: ClipboardList,
          active: location.pathname === '/orders',
        },
        {
          label: 'Inventory',
          path: '/inventory',
          icon: Boxes,
          active: location.pathname === '/inventory',
        },
        {
          label: 'Production',
          path: '/productions',
          icon: Factory,
          active: location.pathname === '/productions',
        },
        {
          label: 'Reports',
          path: '/reports',
          icon: BarChart,
          active: location.pathname === '/reports',
        },
      ];
    } else {
      return [
        ...baseItems,
        {
          label: 'Products',
          path: '/dashboard',
          icon: Package,
          active: location.pathname === '/dashboard',
        },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  if (!authenticated) {
    return (
      <header className="nav-header">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="nav-brand"
              >
                <span className="font-display">Unick Furniture</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-secondary btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn btn-primary btn-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="nav-header">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="nav-brand flex items-center gap-2"
            >
              <Home size={24} className="text-primary-color" />
              <span className="font-display">Unick Furniture</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    nav-link flex items-center gap-2 px-3 py-2 rounded-md transition-colors
                    ${item.active ? 'bg-primary-color text-white' : 'hover:bg-background-secondary'}
                  `}
                >
                  <IconComponent size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-md hover:bg-background-secondary transition-colors"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Cart Button (Customer only) */}
            {user?.role === USER_ROLES.CUSTOMER && (
              <button
                onClick={() => handleNavigation('/cart')}
                className="relative p-2 rounded-md hover:bg-background-secondary transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error-color text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications */}
            <button
              className="relative p-2 rounded-md hover:bg-background-secondary transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-warning-color text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-background-secondary transition-colors"
                title="User Menu"
              >
                <div className="w-8 h-8 bg-primary-color text-white rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="hidden lg:block text-sm font-medium">
                  {getDisplayName()}
                </span>
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-surface border border-border-color rounded-lg shadow-lg z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border-color">
                      <p className="text-sm font-medium text-text-primary">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-text-muted capitalize">
                        {user?.role || 'User'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Mobile Navigation */}
                      <div className="md:hidden">
                        {navigationItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={item.path}
                              onClick={() => handleNavigation(item.path)}
                              className={`
                                w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-background-secondary transition-colors
                                ${item.active ? 'bg-background-secondary text-primary-color' : ''}
                              `}
                            >
                              <IconComponent size={16} />
                              {item.label}
                            </button>
                          );
                        })}
                        <hr className="my-2 border-border-color" />
                      </div>

                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-background-secondary transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-background-secondary text-error-color transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-background-secondary transition-colors"
              title="Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border-color py-4"
            >
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 form-input"
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
