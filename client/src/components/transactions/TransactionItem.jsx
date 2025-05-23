import React from 'react';
import { format, parseISO } from 'date-fns';
import { PencilSquareIcon, TrashIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Helper to get contrasting text color
const getContrastingTextColor = (hexColor) => {
    if (!hexColor) return '#000000'; // Default to black if no color
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF'; // Black for light bg, White for dark bg
};


const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const { type, amount, category, sourceDestination, date, notes } = transaction;
  const isExpense = type === 'expense';

  const categoryColor = category?.color || '#CCCCCC';
  const categoryTextColor = getContrastingTextColor(categoryColor);


  return (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {isExpense ? (
            <ArrowDownCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" />
        ) : (
            <ArrowUpCircleIcon className="h-8 w-8 text-green-500 dark:text-green-400 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-light dark:text-text-dark truncate" title={sourceDestination}>
            {sourceDestination}
          </p>
          <div className="flex items-center space-x-2">
            <span 
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: categoryColor, color: categoryTextColor }}
            >
                {category?.name || 'Uncategorized'}
            </span>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                {format(parseISO(date), 'MMM d, yyyy')}
            </p>
          </div>
          {notes && <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 truncate" title={notes}>{notes}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 ml-4 flex-shrink-0">
        <p className={`text-sm sm:text-base font-semibold ${isExpense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {isExpense ? '-' : '+'}₹{amount.toFixed(2)}
        </p>
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Edit transaction"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(transaction._id)}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Delete transaction"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default TransactionItem;