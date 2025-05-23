import React, { useState, useEffect, useCallback } from 'react';
import goalService from '../services/goal.service';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Loader, { PageLoader } from '../components/common/Loader';
import { toast } from 'sonner';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import GoalList from '../components/goals/GoalList'; // To be created
import AddEditGoalModal from '../components/goals/AddEditGoalModal'; // To be created
import { motion } from 'framer-motion';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await goalService.getGoals();
      setGoals(data);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      setError('Failed to load goals. Please try again.');
      toast.error('Failed to load goals.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleGoalAddedOrUpdated = () => {
    fetchGoals();
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.deleteGoal(id);
        toast.success('Goal deleted successfully');
        fetchGoals();
      } catch (error) {
        toast.error(error.message || 'Failed to delete goal');
      }
    }
  };

  const handleUpdateProgress = async (goalId, newCurrentAmount) => {
    try {
        const updatedGoal = await goalService.updateGoalProgress(goalId, newCurrentAmount);
        toast.success(`Progress for "${updatedGoal.name}" updated!`);
        fetchGoals(); // Refresh list
        if(updatedGoal.isAchieved) {
            toast.success(`🎉 Goal "${updatedGoal.name}" achieved!`);
        }
    } catch (error) {
        toast.error(error.message || 'Failed to update goal progress.');
    }
  };


  if (isLoading && goals.length === 0) {
    return <PageLoader text="Loading Goals..." />;
  }

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-light dark:text-text-dark mb-4 sm:mb-0">
          Financial Goals
        </h1>
        <Button
          variant="primary"
          onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
          leftIcon={<PlusCircleIcon className="h-5 w-5" />}
        >
          Set New Goal
        </Button>
      </div>

      {isLoading && goals.length > 0 && <Loader className="my-4" />}
      {!isLoading && error && <p className="text-center text-red-500 py-4">{error}</p>}
      
      {!isLoading && !error && goals.length === 0 && (
         <Card>
            <CardBody>
                <div className="text-center py-12">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3 3 0 0 0 12 9.75V15m-3 0V9.75m0 0A3 3 0 0 0 9 6.75h-.75M15 9.75V6.75h.75a3 3 0 0 1 3 3V15m0 0a3 3 0 0 0-3-3H9m6 3a3 3 0 0 0-3-3m0 0h-.008v.008H12V12Zm-3 0h.008v.008H9V12Zm3-3.75h.008v.008H12V8.25Zm0 0h.75a3 3 0 0 0 3-3V8.25a3 3 0 0 0-3-3H9.75a3 3 0 0 0-3 3V8.25a3 3 0 0 0 3 3h.75Z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-text-light dark:text-text-dark">No goals set yet</h3>
                    <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
                        Start planning for your future by setting financial goals.
                    </p>
                    <div className="mt-6">
                        <Button
                            variant="primary"
                            onClick={() => { setEditingGoal(null); setIsModalOpen(true); }}
                            leftIcon={<PlusCircleIcon className="h-5 w-5" />}
                        >
                            Set New Goal
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
      )}

      {!error && goals.length > 0 && (
        <GoalList
          goals={goals}
          onEdit={handleEditGoal}
          onDelete={handleDeleteGoal}
          onUpdateProgress={handleUpdateProgress}
        />
      )}

      <AddEditGoalModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingGoal(null); }}
        onGoalAdded={handleGoalAddedOrUpdated}
        onGoalUpdated={handleGoalAddedOrUpdated}
        goalToEdit={editingGoal}
      />
    </motion.div>
  );
};

export default GoalsPage;