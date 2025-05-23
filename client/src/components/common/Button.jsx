import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button', // 'button', 'submit', 'reset'
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost', 'link'
  size = 'md', // 'sm', 'md', 'lg'
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark transition-all duration-150 ease-in-out';

  const variantStyles = {
    primary:
      'bg-primary-light text-white hover:bg-opacity-90 dark:bg-primary-dark dark:text-background-dark dark:hover:bg-opacity-90 focus:ring-primary-light dark:focus:ring-primary-dark',
    secondary:
      'bg-secondary-light text-white hover:bg-opacity-90 dark:bg-secondary-dark dark:text-background-dark dark:hover:bg-opacity-90 focus:ring-secondary-light dark:focus:ring-secondary-dark',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost:
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-light dark:text-primary-dark border border-transparent focus:ring-primary-light dark:focus:ring-primary-dark',
    link:
      'bg-transparent text-primary-light dark:text-primary-dark hover:underline p-0 focus:ring-0',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const loadingStyle = isLoading ? 'opacity-75 cursor-not-allowed' : '';
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const fullWidthStyle = fullWidth ? 'w-full' : '';

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <motion.button
      whileHover={{ scale: (disabled || isLoading || variant === 'link') ? 1 : 1.03 }}
      whileTap={{ scale: (disabled || isLoading || variant === 'link') ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyle} ${disabledStyle} ${fullWidthStyle} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className={`animate-spin -ml-1 mr-3 ${iconSize} text-white`} // Adjust color if needed for variant
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className={`mr-2 ${iconSize}`}>{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className={`ml-2 ${iconSize}`}>{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;