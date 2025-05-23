// client/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../components/common/Button'; // Corrected path from previous step
import { motion } from 'framer-motion';

const NotFoundPage = () => { // Component defined as NotFoundPage
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light dark:bg-background-dark text-center px-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-yellow-400 dark:text-yellow-500" />
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-text-light dark:text-text-dark sm:text-6xl">
          404
        </h1>
        <p className="mt-4 text-xl text-text-muted-light dark:text-text-muted-dark">
          Oops! Page Not Found.
        </p>
        <p className="mt-2 text-base text-text-muted-light dark:text-text-muted-dark">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="mr-4"
          >
            Go Back
          </Button>
          <Link to="/dashboard">
            <Button variant="primary">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage; // <--- ENSURE THIS MATCHES THE FUNCTION NAME