import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
// Import a library or utility to render FontAwesome icons if you store class names
// e.g. import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { fas } from '@fortawesome/free-solid-svg-icons'
// library.add(fas) // Add all solid icons
// For simplicity, we'll just show the icon name or a generic placeholder

const CustomCategoryItem = ({ category, onEdit, onDelete }) => {
  const { name, type, icon, color } = category;

  // A simple way to display an icon based on its name (if it's a known set)
  // Or render <FontAwesomeIcon icon={icon} /> if using FontAwesome properly
  const renderIcon = () => {
    if (icon && icon.startsWith('Fa')) { // Basic check for FontAwesome-like class
      // This is a placeholder. Actual rendering of dynamic FA icons is more complex.
      // You might need a mapping or a component that handles dynamic icon loading.
      // For now, just display the name or a generic icon.
      return <span className="text-xs mr-2 hidden sm:inline">({icon})</span>;
    }
    return null; // Or a default icon
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
      <div className="flex items-center space-x-3">
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: color || '#CCCCCC' }}
          title={`Color: ${color}`}
        ></div>
        <div>
          <p className="text-sm font-medium text-text-light dark:text-text-dark flex items-center">
            {name}
            {renderIcon()}
          </p>
          <p className={`text-xs capitalize ${type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
            {type}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(category)}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Edit category"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(category._id)}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Delete category"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CustomCategoryItem;