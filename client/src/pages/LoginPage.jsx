import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { toast } from 'sonner'; // Or your chosen toast library
import { ArrowPathIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await login(values.email, values.password);
        toast.success('Logged in successfully!');
        navigate(from, { replace: true });
      } catch (error) {
        const errorMessage = error.errors && error.errors.length > 0 
                           ? error.errors.map(e => e.msg || e.message).join(', ')
                           : error.message || 'Login failed. Please check your credentials.';
        toast.error(errorMessage);
        setIsLoading(false);
      }
    },
  });

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          error={formik.errors.email}
          touched={formik.touched.email}
          leftIcon={<EnvelopeIcon />}
          disabled={isLoading}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          error={formik.errors.password}
          touched={formik.touched.password}
          leftIcon={<LockClosedIcon />}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-dark dark:ring-offset-gray-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted-light dark:text-text-muted-dark">
              Remember me
            </label> */}
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" // TODO: Implement forgot password page
                className="font-medium text-primary-light hover:text-opacity-80 dark:text-primary-dark dark:hover:text-opacity-80"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
        Not a member?{' '}
        <Link to="/signup" className="font-medium text-primary-light hover:text-opacity-80 dark:text-primary-dark dark:hover:text-opacity-80">
          Sign up now
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginPage;