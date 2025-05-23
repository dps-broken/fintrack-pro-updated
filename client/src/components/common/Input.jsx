import React from 'react';
import { motion } from 'framer-motion';

const Input = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  touched,
  disabled = false,
  className = '',
  inputClassName = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const hasError = touched && error;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {React.cloneElement(leftIcon, { className: `h-5 w-5 ${hasError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}` })}
          </div>
        )}
        <input
          type={type}
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full appearance-none rounded-md border px-3 py-2 
            placeholder-gray-400 dark:placeholder-gray-500 
            focus:outline-none sm:text-sm
            bg-card-light dark:bg-card-dark
            text-text-light dark:text-text-dark
            transition-colors duration-150
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${hasError
              ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}
            ${inputClassName}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
             {React.cloneElement(rightIcon, { className: `h-5 w-5 ${hasError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}` })}
          </div>
        )}
      </div>
      {hasError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;