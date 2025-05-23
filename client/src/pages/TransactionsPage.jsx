import React, { useState, useEffect, useCallback } from 'react';
import transactionService from '../services/transaction.service';
import categoryService from '../services/category.service'; // For category filter options
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Loader, { PageLoader } from '../components/common/Loader';
import { toast } from 'sonner';
import { PlusCircleIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import TransactionList from '../components/transactions/TransactionList'; // To be created
import AddTransactionModal from '../components/transactions/AddTransactionModal'; // To be created
import TransactionFilters from '../components/transactions/TransactionFilters'; // To be created
import { motion } from 'framer-motion';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // For edit functionality

  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filters, setFilters] = useState({ // Default filters
    page: 1,
    limit: 10,
    sortBy: 'date',
    order: 'desc',
    // type: '', category: '', startDate: '', endDate: '', search: '' (will be set by TransactionFilters)
  });

  const fetchTransactions = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await transactionService.getTransactions(currentFilters);
      setTransactions(data.transactions);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalTransactions(data.totalTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError('Failed to load transactions. Please try again.');
      toast.error('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
        const catData = await categoryService.getCategories(); // Get all types
        setCategories(catData);
    } catch (error) {
        toast.error("Could not load categories for filtering.");
        console.error("Failed to fetch categories:", error);
    }
  }, []);


  useEffect(() => {
    fetchTransactions(filters);
    fetchCategories(); // Fetch categories for filter dropdown
  }, [filters, fetchTransactions, fetchCategories]);

  const handleTransactionAddedOrUpdated = () => {
    fetchTransactions(filters); // Re-fetch to reflect changes
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        toast.success('Transaction deleted successfully');
        fetchTransactions(filters); // Refresh list
      } catch (error) {
        toast.error(error.message || 'Failed to delete transaction');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (newSortBy, newOrder) => {
    setFilters(prev => ({ ...prev, sortBy: newSortBy, order: newOrder, page: 1 }));
  };


  if (isLoading && transactions.length === 0) { // Show full page loader only on initial load
    return <PageLoader text="Loading Transactions..." />;
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
          Transactions
        </h1>
        <Button
          variant="primary"
          onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
          leftIcon={<PlusCircleIcon className="h-5 w-5" />}
        >
          Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
            <TransactionFilters
                onFilterChange={handleFilterChange}
                categories={categories}
                currentFilters={filters}
                onSortChange={handleSortChange} // Pass sorting handler
            />
        </CardHeader>
        <CardBody>
          {isLoading && transactions.length > 0 && <Loader className="my-4"/> }
          {!isLoading && error && <p className="text-center text-red-500 py-4">{error}</p>}
          {!isLoading && !error && transactions.length === 0 && (
            <p className="text-center text-text-muted-light dark:text-text-muted-dark py-8">
              No transactions found. Add your first one!
            </p>
          )}
          {!error && transactions.length > 0 && (
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              currentPage={currentPage}
              totalPages={totalPages}
              totalTransactions={totalTransactions}
              onPageChange={handlePageChange}
              filters={filters} // Pass filters for "items per page" display or similar
            />
          )}
        </CardBody>
      </Card>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onTransactionAdded={handleTransactionAddedOrUpdated}
        onTransactionUpdated={handleTransactionAddedOrUpdated}
        categories={categories} // Pass all categories to modal
        transactionToEdit={editingTransaction}
      />
    </motion.div>
  );
};

export default TransactionsPage;