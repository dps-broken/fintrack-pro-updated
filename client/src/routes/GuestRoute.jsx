import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useContext(AuthContext);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard'; // Where to redirect if logged in

  if (isLoadingAuth) {
    // Optional: Loading state
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is already authenticated, redirect them away from guest pages (e.g., to dashboard)
    return <Navigate to={from} replace />;
  }

  // User is not authenticated, allow access to guest routes (Login, Signup)
  return <Outlet />;
};

export default GuestRoute;