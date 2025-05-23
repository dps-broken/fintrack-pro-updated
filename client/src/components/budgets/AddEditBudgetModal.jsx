import React, { useState } from 'react';
import Modal from '../common/Modal';
import BudgetForm from './BudgetForm';
import budgetService from '../../services/budget.service';
import { toast } from 'sonner';

const AddEditBudgetModal = ({
  isOpen,
  onClose,
  onBudgetAdded,
  onBudgetUpdated,
  categories, // Expense categories
  budgetToEdit = null
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const budgetData = {
        ...values,
        startDate: values.startDate instanceof Date ? values.startDate.toISOString() : values.startDate,
        endDate: values.endDate instanceof Date ? values.endDate.toISOString() : (values.period !== 'custom' ? null : values.endDate),
        amount: parseFloat(values.amount),
        category: values.category === "" ? null : values.category // Ensure empty string becomes null
    };
     if (values.period !== 'custom') { // Clear endDate if not custom
        delete budgetData.endDate;
    }


    try {
      if (budgetToEdit) {
        const updatedBudget = await budgetService.updateBudget(budgetToEdit._id, budgetData);
        toast.success('Budget updated successfully!');
        if (onBudgetUpdated) onBudgetUpdated(updatedBudget);
      } else {
        const newBudget = await budgetService.createBudget(budgetData);
        toast.success('Budget set successfully!');
        if (onBudgetAdded) onBudgetAdded(newBudget);
      }
      onClose();
    } catch (error) {
      const errorMsg = error.errors ? error.errors.map(e => e.msg || e.message).join(', ') : (error.message || 'An unexpected error occurred.');
      toast.error(`Error: ${errorMsg}`);
      console.error("Budget submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialFormValues = budgetToEdit
    ? {
        name: budgetToEdit.name,
        category: budgetToEdit.category?._id || budgetToEdit.category || null, // Handle populated or ID
        amount: budgetToEdit.amount,
        period: budgetToEdit.period,
        startDate: new Date(budgetToEdit.startDate),
        endDate: budgetToEdit.endDate ? new Date(budgetToEdit.endDate) : null,
        notificationsEnabled: budgetToEdit.notificationsEnabled !== undefined ? budgetToEdit.notificationsEnabled : true,
      }
    : { // Default for new budget
        name: '',
        category: null,
        amount: '',
        period: 'monthly',
        startDate: new Date(new Date().setDate(1)),
        endDate: null,
        notificationsEnabled: true,
      };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Budget' : 'Set New Budget'}
      size="lg"
    >
      <BudgetForm
        onSubmit={handleSubmit}
        initialValues={initialFormValues}
        categories={categories}
        isEditing={!!budgetToEdit}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default AddEditBudgetModal;