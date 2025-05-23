import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', elevation = 'md', hoverEffect = false, ...props }) => {
  const baseStyle = 'bg-card-light dark:bg-card-dark rounded-lg overflow-hidden';

  const elevationStyles = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: 'shadow-none',
  };

  const hoverStyles = hoverEffect ? 'transition-all duration-300 ease-in-out hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-1' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyle} ${elevationStyles[elevation]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '', title, actions }) => (
  <div className={`px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${className}`}>
    {title && <h3 className="text-lg font-semibold leading-6 text-text-light dark:text-text-dark">{title}</h3>}
    {children}
    {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-4 py-5 sm:p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-4 py-3 sm:px-6 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600 ${className}`}>
    {children}
  </div>
);

export default Card;