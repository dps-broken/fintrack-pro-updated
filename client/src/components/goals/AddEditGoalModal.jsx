import React, { useState } from 'react';
import Modal from '../common/Modal';
import GoalForm from './GoalForm';
import goalService from '../../services/goal.service';
import { toast } from 'sonner';

const AddEditGoalModal = ({
  isOpen,
  onClose,
  onGoalAdded,
  onGoalUpdated,
  goalToEdit = null
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const goalData = {
        ...values,
        targetAmount: parseFloat(values.targetAmount),
        currentAmount: parseFloat(values.currentAmount || 0),
        deadline: values.deadline instanceof Date ? values.deadline.toISOString() : (values.deadline || null), // Ensure null if not set
    };

    try {
      if (goalToEdit) {
        const updatedGoal = await goalService.updateGoal(goalToEdit._id, goalData);
        toast.success('Goal updated successfully!');
        if (onGoalUpdated) onGoalUpdated(updatedGoal);
      } else {
        const newGoal = await goalService.createGoal(goalData);
        toast.success('Goal set successfully!');
        if (onGoalAdded) onGoalAdded(newGoal);
      }
      onClose();
    } catch (error) {
      const errorMsg = error.errors ? error.errors.map(e => e.msg || e.message).join(', ') : (error.message || 'An unexpected error occurred.');
      toast.error(`Error: ${errorMsg}`);
      console.error("Goal submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialFormValues = goalToEdit
    ? {
        name: goalToEdit.name,
        targetAmount: goalToEdit.targetAmount,
        currentAmount: goalToEdit.currentAmount || 0,
        deadline: goalToEdit.deadline ? new Date(goalToEdit.deadline) : null,
        description: goalToEdit.description || '',
      }
    : { // Default for new goal
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: null,
        description: '',
      };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Financial Goal' : 'Set New Financial Goal'}
      size="lg"
    >
      <GoalForm
        onSubmit={handleSubmit}
        initialValues={initialFormValues}
        isEditing={!!goalToEdit}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default AddEditGoalModal;