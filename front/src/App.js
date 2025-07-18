import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Import modern components
import Header from './components/Header';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { ToastContainer } from './components/ui/Alert';

// Import utilities
import { isAuthenticated, canAccessRoute, getCurrentUser, addAuthListener } from './utils/auth';
import { USER_ROLES } from './utils/constants';

// Lazy load components for better performance
const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Cart = React.lazy(() => import('./components/Customers/Cart'));
const ProductPage = React.lazy(() => import('./components/Admin/ProductPage'));
const ProductionPage = React.lazy(() => import('./components/Admin/ProductionPage'));
const InventoryPage = React.lazy(() => import('./components/Admin/InventoryPage'));
const OrderPage = React.lazy(() => import('./components/Admin/OrderPage'));
const Report = React.lazy(() => import('./components/Admin/Report'));

/**
 * Error Boundary Component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-primary">
          <div className="text-center p-8">
            <h1 className="text-h2 text-error-color mb-4">Oops! Something went wrong</h1>
            <p className="text-body text-text-muted mb-6">
              We apologize for the inconvenience. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  if (!authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && !canAccessRoute(requiredRole)) {
    // Redirect based on user role
    const dashboardPath = user?.role === USER_ROLES.CUSTOMER ? '/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

/**
 * Public Route Component (redirect if already authenticated)
 */
const PublicRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  if (authenticated) {
    const dashboardPath = '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

/**
 * Page Layout Component
 */
const PageLayout = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  // Don't show header on auth pages
  const hideHeader = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background-primary">
      {!hideHeader && authenticated && <Header />}
      
      <main className={`${!hideHeader && authenticated ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

/**
 * Route Loading Wrapper
 */
const RouteWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullPage text="Loading..." />}>
    {children}
  </Suspense>
);

/**
 * Main App Component
 */
function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = addAuthListener((newAuthState) => {
      setAuthState({
        isAuthenticated: newAuthState.isAuthenticated,
        user: newAuthState.user,
        loading: false,
      });
    });

    // Initial auth check
    setTimeout(() => {
      setAuthState({
        isAuthenticated: isAuthenticated(),
        user: getCurrentUser(),
        loading: false,
      });
    }, 100);

    return unsubscribe;
  }, []);

  // Show loading screen while checking authentication
  if (authState.loading) {
    return <LoadingSpinner fullPage text="Initializing..." />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <PageLayout>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <RouteWrapper>
                    <Login />
                  </RouteWrapper>
                </PublicRoute>
              }
            />
            
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RouteWrapper>
                    <Register />
                  </RouteWrapper>
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RouteWrapper>
                    <Dashboard />
                  </RouteWrapper>
                </ProtectedRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.CUSTOMER}>
                  <RouteWrapper>
                    <Cart />
                  </RouteWrapper>
                </ProtectedRoute>
              }
            />

            {/* Admin/Employee Routes */}
            <Route
              path="/product"
              element={
                <ProtectedRoute requiredRole={[USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN]}>
                  <RouteWrapper>
                    <ProductPage />
                  </RouteWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute requiredRole={[USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN]}>
                  <RouteWrapper>
                    <InventoryPage />
                  </RouteWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/productions"
              element={
                <ProtectedRoute requiredRole={[USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN]}>
                  <RouteWrapper>
                    <ProductionPage />
                  </RouteWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute requiredRole={[USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN]}>
                  <RouteWrapper>
                    <OrderPage />
                  </RouteWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole={[USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN]}>
                  <RouteWrapper>
                    <Report />
                  </RouteWrapper>
                </ProtectedRoute>
              }
            />

            {/* Default Redirects */}
            <Route
              path="/"
              element={
                authState.isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center p-8">
                    <h1 className="text-display-1 text-primary-color mb-4">404</h1>
                    <h2 className="text-h3 text-text-primary mb-4">Page Not Found</h2>
                    <p className="text-body text-text-muted mb-6">
                      The page you're looking for doesn't exist or has been moved.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => window.history.back()}
                        className="btn btn-secondary"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="btn btn-primary"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </PageLayout>

        {/* Global Toast Container */}
        <ToastContainer position="top-right" />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
