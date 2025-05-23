import React, { useState } from 'react';
import GoalItem from './GoalItem';
import UpdateGoalProgressModal from './UpdateGoalProgressModal';
import { AnimatePresence, motion } from 'framer-motion';

const GoalList = ({ goals, onEdit, onDelete, onUpdateProgress }) => {
  const [isUpdateProgressModalOpen, setIsUpdateProgressModalOpen] = useState(false);
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState(null);

  if (!goals || goals.length === 0) {
    // This case handled by GoalsPage for a more prominent message
    return null;
  }

  const handleOpenUpdateProgressModal = (goal) => {
    setSelectedGoalForProgress(goal);
    setIsUpdateProgressModalOpen(true);
  };

  const handleCloseUpdateProgressModal = () => {
    setSelectedGoalForProgress(null);
    setIsUpdateProgressModalOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Separate active and achieved goals
  const activeGoals = goals.filter(g => !g.isAchieved);
  const achievedGoals = goals.filter(g => g.isAchieved);

  return (
    <>
      {activeGoals.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4 mt-6">Active Goals</h2>
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {activeGoals.map((goal) => (
                <GoalItem
                  key={goal._id}
                  goal={goal}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onOpenUpdateProgressModal={handleOpenUpdateProgressModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {achievedGoals.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            Achieved Goals
          </h2>
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {achievedGoals.map((goal) => (
                <GoalItem
                  key={goal._id}
                  goal={goal}
                  onEdit={onEdit} // Might want to disable edit for achieved goals or limit it
                  onDelete={onDelete}
                  onOpenUpdateProgressModal={handleOpenUpdateProgressModal} // Or hide this for achieved
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
      
      {isUpdateProgressModalOpen && selectedGoalForProgress && (
        <UpdateGoalProgressModal
            isOpen={isUpdateProgressModalOpen}
            onClose={handleCloseUpdateProgressModal}
            goal={selectedGoalForProgress}
            onProgressUpdate={onUpdateProgress} // Passed from GoalsPage
        />
      )}
    </>
  );
};

export default GoalList;