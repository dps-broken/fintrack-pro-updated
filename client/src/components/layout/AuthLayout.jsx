import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import FinTrackLogo from '../../assets/images/fintrack-logo.png'; // Ensure this path is correct
import { ThemeContext } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  const { actualTheme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    if (actualTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-full text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-text-light dark:hover:text-text-dark focus:outline-none"
          aria-label={actualTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {actualTheme === 'dark' ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/" className="flex justify-center"> {/* Link to homepage or dashboard if unauthenticated access to / is not allowed */}
          <img
            className="mx-auto h-12 w-auto"
            src={FinTrackLogo}
            alt="FinTrack Pro"
          />
        </Link>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-text-light dark:text-text-dark">
          Welcome to FinTrack Pro
        </h2>
        {/* You can add a subtitle here if desired, e.g., "Sign in to your account" or "Create an account" */}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-card-light dark:bg-card-dark py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <Outlet /> {/* Login or Signup form will render here, passed from App.js routing */}
        </div>
      </motion.div>
      <p className="mt-8 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
        © {new Date().getFullYear()} FinTrack Pro. All rights reserved.
      </p>
    </div>
  );
};

export default AuthLayout;