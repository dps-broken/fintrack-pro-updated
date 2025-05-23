import React from 'react';
import { format, parseISO } from 'date-fns';
import BudgetProgress from './BudgetProgress';
import { PencilSquareIcon, TrashIcon, BanknotesIcon, TagIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import Card, { CardBody, CardFooter } from '../common/Card'; // Use Card component
import { motion } from 'framer-motion';

const BudgetItem = ({ budget, onEdit, onDelete }) => {
  const { name, category, amount, period, startDate, endDate, totalSpent, progress } = budget;

  const getPeriodText = () => {
    if (period === 'monthly') return `Monthly (from ${format(parseISO(startDate), 'MMM d, yyyy')})`;
    if (period === 'yearly') return `Yearly (from ${format(parseISO(startDate), 'MMM d, yyyy')})`;
    if (period === 'custom' && endDate) {
      return `Custom: ${format(parseISO(startDate), 'MMM d')} - ${format(parseISO(endDate), 'MMM d, yyyy')}`;
    }
    return period.charAt(0).toUpperCase() + period.slice(1);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };


  return (
    <motion.div variants={itemVariants}>
        <Card className="flex flex-col h-full" hoverEffect>
        <CardBody className="flex-grow">
            <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-primary-light dark:text-primary-dark truncate" title={name}>
                {name}
            </h3>
            <div className="flex space-x-1">
                <button
                onClick={() => onEdit(budget)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md"
                aria-label="Edit budget"
                >
                <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                onClick={() => onDelete(budget._id)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md"
                aria-label="Delete budget"
                >
                <TrashIcon className="h-5 w-5" />
                </button>
            </div>
            </div>

            <div className="space-y-3">
            <div className="flex items-center text-sm text-text-muted-light dark:text-text-muted-dark">
                <BanknotesIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Amount: <span className="font-medium text-text-light dark:text-text-dark">₹{amount.toFixed(2)}</span></span>
            </div>
            {category ? (
                <div className="flex items-center text-sm text-text-muted-light dark:text-text-muted-dark">
                <TagIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Category: <span className="font-medium text-text-light dark:text-text-dark">{category.name}</span></span>
                </div>
            ) : (
                <div className="flex items-center text-sm text-text-muted-light dark:text-text-muted-dark">
                <TagIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Category: <span className="font-medium text-text-light dark:text-text-dark">Overall Expenses</span></span>
                </div>
            )}
            <div className="flex items-center text-sm text-text-muted-light dark:text-text-muted-dark">
                <CalendarDaysIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Period: {getPeriodText()}</span>
            </div>
            </div>
        </CardBody>
        <CardFooter className="bg-gray-50 dark:bg-slate-700/50">
            <BudgetProgress current={totalSpent || 0} total={amount} />
            <div className="mt-2 flex justify-between text-xs text-text-muted-light dark:text-text-muted-dark">
                <span>Spent: ₹{(totalSpent || 0).toFixed(2)}</span>
                <span>Remaining: ₹{(amount - (totalSpent || 0)).toFixed(2)}</span>
            </div>
        </CardFooter>
        </Card>
    </motion.div>
  );
};

export default BudgetItem;