import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { toast } from 'sonner';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await signup(values.name, values.email, values.password);
        toast.success('Account created successfully! Welcome!');
        navigate('/dashboard'); // Or to a welcome/onboarding page
      } catch (error) {
        const errorMessage = error.errors && error.errors.length > 0 
                           ? error.errors.map(e => e.msg || e.message).join(', ')
                           : error.message || 'Signup failed. Please try again.';
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
          id="name"
          name="name"
          type="text"
          label="Full Name"
          placeholder="John Doe"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          error={formik.errors.name}
          touched={formik.touched.name}
          leftIcon={<UserIcon />}
          disabled={isLoading}
        />

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

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
          error={formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword}
          leftIcon={<LockClosedIcon />}
          disabled={isLoading}
        />

        <div>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-light hover:text-opacity-80 dark:text-primary-dark dark:hover:text-opacity-80">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default SignupPage;