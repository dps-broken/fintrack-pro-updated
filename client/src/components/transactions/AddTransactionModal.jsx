import React, { useState } from 'react';
import Modal from '../common/Modal';
import TransactionForm from './TransactionForm';
import transactionService from '../../services/transaction.service';
import { toast } from 'sonner';

const AddTransactionModal = ({
  isOpen,
  onClose,
  onTransactionAdded,    // Callback after successful addition
  onTransactionUpdated,  // Callback after successful update
  categories,            // All categories for the form
  transactionToEdit = null // Pass transaction object if editing
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      if (transactionToEdit) {
        // Update existing transaction
        const updatedData = {
            ...values,
            // Ensure date is in a format backend expects if it changed,
            // Formik handles date object, backend Mongoose model can parse it.
            date: values.date instanceof Date ? values.date.toISOString() : values.date,
        };
        const updatedTransaction = await transactionService.updateTransaction(transactionToEdit._id, updatedData);
        toast.success('Transaction updated successfully!');
        if (onTransactionUpdated) onTransactionUpdated(updatedTransaction);
      } else {
        // Add new transaction
         const newTransactionData = {
            ...values,
            date: values.date instanceof Date ? values.date.toISOString() : values.date,
        };
        const newTransaction = await transactionService.addTransaction(newTransactionData);
        toast.success('Transaction added successfully!');
        if (onTransactionAdded) onTransactionAdded(newTransaction);
      }
      onClose(); // Close modal on success
    } catch (error) {
      const errorMsg = error.errors ? error.errors.map(e => e.msg || e.message).join(', ') : (error.message || 'An unexpected error occurred.');
      toast.error(`Error: ${errorMsg}`);
      console.error("Transaction submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialFormValues = transactionToEdit
    ? {
        type: transactionToEdit.type,
        amount: transactionToEdit.amount,
        category: transactionToEdit.category._id || transactionToEdit.category, // Ensure it's category ID
        sourceDestination: transactionToEdit.sourceDestination,
        date: new Date(transactionToEdit.date), // Ensure date is a Date object for DatePicker
        notes: transactionToEdit.notes || '',
      }
    : { // Default for new transaction
        type: 'expense',
        amount: '',
        category: '',
        sourceDestination: '',
        date: new Date(),
        notes: '',
      };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}
      size="lg" // Or md
    >
      <TransactionForm
        onSubmit={handleSubmit}
        initialValues={initialFormValues}
        categories={categories}
        isEditing={!!transactionToEdit}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default AddTransactionModal;