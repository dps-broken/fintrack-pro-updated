import React, { useContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; // For page transitions

// Contexts
import { ThemeContext } from './contexts/ThemeContext';
import { AuthContext } from './contexts/AuthContext';

// Layout Components
import MainLayout from './components/layout/MainLayout'; // Assuming Navbar and Sidebar are part of this
import AuthLayout from './components/layout/AuthLayout'; // For Login/Signup pages

// Page Components
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import GoalsPage from './pages/GoalsPage';
import BudgetPage from './pages/BudgetPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';

// Route Protectors
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute'; // For login/signup, redirect if logged in

function App() {
  const { theme } = useContext(ThemeContext);
  const { checkAuthStatus, isLoadingAuth } = useContext(AuthContext);
  const location = useLocation(); // For AnimatePresence key

  useEffect(() => {
    // Set the theme class on the HTML element
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    checkAuthStatus(); // Check auth status on app load
  }, [checkAuthStatus]);

  if (isLoadingAuth) {
    // You can return a global loading spinner here
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait"> {/* For page transitions */}
      <Routes location={location} key={location.pathname}>
        {/* Routes for authenticated users (within MainLayout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Add other protected routes here */}
          </Route>
        </Route>

        {/* Routes for guests (login, signup - within AuthLayout) */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
        </Route>

        {/* Fallback for Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;