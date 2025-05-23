import React, { useState, useEffect, useCallback } from 'react';
// import budgetService from '../../services/budget.service';
import budgetService from '../services/budget.service';
import categoryService from '../services/category.service';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Loader, { PageLoader } from '../components/common/Loader';
import { toast } from 'sonner';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import BudgetList from '../components/budgets/BudgetList'; // To be created
import AddEditBudgetModal from '../components/budgets/AddEditBudgetModal'; // To be created
import { motion } from 'framer-motion';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]); // Expense categories for budget creation
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await budgetService.getBudgets(); // Fetches budgets with status
      setBudgets(data);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      setError('Failed to load budgets. Please try again.');
      toast.error('Failed to load budgets.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const catData = await categoryService.getCategories('expense'); // Only expense categories for budgeting
      setCategories(catData.filter(c => !c.isPredefined || ['Food', 'Travel', 'Shopping', 'Utilities', 'Entertainment', 'Healthcare', 'Smoking', 'Room Items'].includes(c.name))); // Filter relevant predefined
    } catch (error) {
      toast.error("Could not load categories for budgets.");
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [fetchBudgets, fetchCategories]);

  const handleBudgetAddedOrUpdated = () => {
    fetchBudgets();
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.deleteBudget(id);
        toast.success('Budget deleted successfully');
        fetchBudgets();
      } catch (error) {
        toast.error(error.message || 'Failed to delete budget');
      }
    }
  };

  if (isLoading && budgets.length === 0) {
    return <PageLoader text="Loading Budgets..." />;
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
          Budgets
        </h1>
        <Button
          variant="primary"
          onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
          leftIcon={<PlusCircleIcon className="h-5 w-5" />}
        >
          Set New Budget
        </Button>
      </div>

      {isLoading && budgets.length > 0 && <Loader className="my-4" />}
      {!isLoading && error && <p className="text-center text-red-500 py-4">{error}</p>}
      
      {!isLoading && !error && budgets.length === 0 && (
        <Card>
            <CardBody>
                <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-text-light dark:text-text-dark">No budgets set</h3>
                    <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
                        Get started by creating a new budget for your spending categories.
                    </p>
                    <div className="mt-6">
                        <Button
                            variant="primary"
                            onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
                            leftIcon={<PlusCircleIcon className="h-5 w-5" />}
                        >
                            Set New Budget
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
      )}

      {!error && budgets.length > 0 && (
        <BudgetList
          budgets={budgets}
          onEdit={handleEditBudget}
          onDelete={handleDeleteBudget}
        />
      )}

      <AddEditBudgetModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBudget(null); }}
        onBudgetAdded={handleBudgetAddedOrUpdated}
        onBudgetUpdated={handleBudgetAddedOrUpdated}
        categories={categories.filter(c => c.type === 'expense')} // Pass only expense categories
        budgetToEdit={editingBudget}
      />
    </motion.div>
  );
};

export default BudgetPage;