import React from 'react';
import BudgetItem from './BudgetItem';
import { AnimatePresence, motion } from 'framer-motion';

const BudgetList = ({ budgets, onEdit, onDelete }) => {
  if (!budgets || budgets.length === 0) {
    // This case is handled by the BudgetPage component for a more prominent message
    return null; 
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation for each item
        delayChildren: 0.2,
      },
    },
  };


  return (
    <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <AnimatePresence> {/* To animate items out when deleted */}
        {budgets.map((budget) => (
          <BudgetItem
            key={budget._id}
            budget={budget}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default BudgetList;