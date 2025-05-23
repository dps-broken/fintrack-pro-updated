import React from 'react';
import { motion } from 'framer-motion';

const BudgetProgress = ({ current, total, height = 'h-2.5', showPercentage = true }) => {
  const percentage = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  let barColorClass = 'bg-green-500 dark:bg-green-400'; // Default for under budget

  if (percentage >= 100) {
    barColorClass = 'bg-red-500 dark:bg-red-400'; // Over budget
  } else if (percentage >= 80) {
    barColorClass = 'bg-yellow-500 dark:bg-yellow-400'; // Nearing budget
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} overflow-hidden`}>
        <motion.div
          className={`${barColorClass} ${height} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-right text-text-muted-light dark:text-text-muted-dark mt-1">
          {percentage.toFixed(1)}% spent
          (₹{current.toFixed(2)} / ₹{total.toFixed(2)})
        </p>
      )}
    </div>
  );
};

export default BudgetProgress;