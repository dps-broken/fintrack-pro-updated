import React from 'react';
import TransactionItem from './TransactionItem';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from 'framer-motion';

const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalTransactions,
  onPageChange,
  filters, // To display items per page info
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-text-light dark:text-text-dark">No Transactions Found</h3>
        <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
          Try adjusting your filters or add new transactions.
        </p>
      </div>
    );
  }

  const limit = filters?.limit || 10;
  const fromItem = (currentPage - 1) * limit + 1;
  const toItem = Math.min(currentPage * limit, totalTransactions);

  return (
    <div className="bg-card-light dark:bg-card-dark shadow overflow-hidden sm:rounded-md">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <AnimatePresence initial={false}> {/* Set initial={false} to avoid animation on first load if items already exist */}
            {transactions.map((transaction) => (
            <TransactionItem
                key={transaction._id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark px-4 py-3 sm:px-6"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
              Showing <span className="font-medium">{fromItem}</span> to <span className="font-medium">{toItem}</span> of{' '}
              <span className="font-medium">{totalTransactions}</span> results
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-text-light dark:text-text-dark ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" aria-hidden="true" />
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-text-light dark:text-text-dark ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-5 w-5 ml-1" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default TransactionList;