import React from 'react';

const Loader = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'border-primary-light dark:border-primary-dark',
    secondary: 'border-secondary-light dark:border-secondary-dark',
    white: 'border-white',
    neutral: 'border-gray-500 dark:border-gray-400',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      ></div>
    </div>
  );
};

export const PageLoader = ({ text = "Loading..." }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <Loader size="lg" />
        {text && <p className="mt-4 text-lg font-medium text-text-light dark:text-text-dark">{text}</p>}
    </div>
);


export default Loader;