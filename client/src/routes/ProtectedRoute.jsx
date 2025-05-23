import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useContext(AuthContext);
  const location = useLocation();

  if (isLoadingAuth) {
    // Optional: Show a loading spinner or a blank page while auth status is being checked
    // This prevents a flash of the login page if the user is actually authenticated.
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    // Pass the current location in state so they can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;