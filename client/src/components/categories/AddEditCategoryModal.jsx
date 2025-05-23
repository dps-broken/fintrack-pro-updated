import React, { useState } from 'react';
import Modal from '../common/Modal';
import CategoryForm from './CategoryForm';
import categoryService from '../../services/category.service';
import { toast } from 'sonner';

const AddEditCategoryModal = ({
  isOpen,
  onClose,
  onCategorySaved, // Generic callback for add/update
  categoryToEdit = null,
  existingCategories = [] // Pass user's custom categories for validation
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const categoryData = { ...values };

    try {
      if (categoryToEdit) {
        // Type cannot be changed, so it's not in the form for editing usually
        // Backend should also prevent type change on update
        const updatedCategory = await categoryService.updateCategory(categoryToEdit._id, categoryData);
        toast.success(`Category "${updatedCategory.name}" updated successfully!`);
      } else {
        const newCategory = await categoryService.createCategory(categoryData);
        toast.success(`Category "${newCategory.name}" added successfully!`);
      }
      if (onCategorySaved) onCategorySaved();
      onClose();
    } catch (error) {
      const errorMsg = error.errors ? error.errors.map(e => e.msg || e.message).join(', ') : (error.message || 'An unexpected error occurred.');
      toast.error(`Error: ${errorMsg}`);
      console.error("Category submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initialFormValues = categoryToEdit
    ? {
        name: categoryToEdit.name,
        type: categoryToEdit.type,
        icon: categoryToEdit.icon || '',
        color: categoryToEdit.color || '#CCCCCC',
      }
    : { // Default for new category
        name: '',
        type: 'expense', // Default to expense
        icon: '',
        color: '#CCCCCC',
      };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Custom Category' : 'Add Custom Category'}
      size="md"
    >
      <CategoryForm
        onSubmit={handleSubmit}
        initialValues={initialFormValues}
        isEditing={!!categoryToEdit}
        isLoading={isLoading}
        existingCategories={existingCategories}
      />
    </Modal>
  );
};

export default AddEditCategoryModal;