import React from 'react';
import CustomCategoryItem from './CustomCategoryItem';
import { motion, AnimatePresence } from 'framer-motion';

const CustomCategoryList = ({ categories, onEdit, onDelete }) => {
  if (!categories || categories.length === 0) {
    // This state will be handled by the ProfilePage component
    return null; 
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
  };


  return (
    <motion.div 
        className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <AnimatePresence>
        {categories.map((category) => (
          <motion.div key={category._id} variants={itemVariants} exit="exit">
            <CustomCategoryItem
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomCategoryList;