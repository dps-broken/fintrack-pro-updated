import React, { useState, useEffect } from 'react';
import Select from '../common/Select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Input from '../common/Input';
import Button from '../common/Button';
import { FunnelIcon, MagnifyingGlassIcon, CalendarDaysIcon, AdjustmentsHorizontalIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from 'framer-motion';

const TransactionFilters = ({ onFilterChange, categories, currentFilters, onSortChange }) => {
  const [localFilters, setLocalFilters] = useState({
    type: currentFilters?.type || '',
    category: currentFilters?.category || '',
    startDate: currentFilters?.startDate ? new Date(currentFilters.startDate) : null,
    endDate: currentFilters?.endDate ? new Date(currentFilters.endDate) : null,
    search: currentFilters?.search || '',
    minAmount: currentFilters?.minAmount || '',
    maxAmount: currentFilters?.maxAmount || '',
  });

  const [sortBy, setSortBy] = useState(currentFilters?.sortBy || 'date');
  const [sortOrder, setSortOrder] = useState(currentFilters?.order || 'desc');

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Sync local state if external currentFilters change (e.g. on page load)
    setLocalFilters({
        type: currentFilters?.type || '',
        category: currentFilters?.category || '',
        startDate: currentFilters?.startDate ? new Date(currentFilters.startDate) : null,
        endDate: currentFilters?.endDate ? new Date(currentFilters.endDate) : null,
        search: currentFilters?.search || '',
        minAmount: currentFilters?.minAmount || '',
        maxAmount: currentFilters?.maxAmount || '',
    });
    setSortBy(currentFilters?.sortBy || 'date');
    setSortOrder(currentFilters?.order || 'desc');
  }, [currentFilters]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setLocalFilters(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
  };

  const handleDateChange = (name, date) => {
    setLocalFilters(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtersToApply = {
        ...localFilters,
        startDate: localFilters.startDate ? localFilters.startDate.toISOString().split('T')[0] : '',
        endDate: localFilters.endDate ? localFilters.endDate.toISOString().split('T')[0] : '',
        minAmount: localFilters.minAmount ? parseFloat(localFilters.minAmount) : '',
        maxAmount: localFilters.maxAmount ? parseFloat(localFilters.maxAmount) : '',
    };
    // Remove empty string keys before submitting
    Object.keys(filtersToApply).forEach(key => {
        if (filtersToApply[key] === '' || filtersToApply[key] === null || Number.isNaN(filtersToApply[key])) {
            delete filtersToApply[key];
        }
    });
    onFilterChange(filtersToApply);
  };

  const handleClearFilters = () => {
    const cleared = { type: '', category: '', startDate: null, endDate: null, search: '', minAmount: '', maxAmount: '' };
    setLocalFilters(cleared);
    onFilterChange({}); // Send empty object to reset to defaults
    setShowAdvanced(false);
  };

  const handleSortFieldChange = (selectedOption) => {
    setSortBy(selectedOption.value);
    onSortChange(selectedOption.value, sortOrder);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    onSortChange(sortBy, newOrder);
  };


  const typeOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ];

  const categoryOptions = categories
    .filter(cat => !localFilters.type || cat.type === localFilters.type) // Filter categories by selected type
    .map(cat => ({ value: cat._id, label: cat.name }));

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'sourceDestination', label: 'Description' },
    // { value: 'category.name', label: 'Category' }, // Sorting by populated field needs backend support
  ];


  return (
    <div className="py-2 space-y-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {/* Basic Filters always visible */}
        <Input
          id="search" name="search" type="text" placeholder="Search description/notes..."
          value={localFilters.search} onChange={handleInputChange}
          leftIcon={<MagnifyingGlassIcon />}
        />
        <Select
          id="type" name="type" placeholder="Type (All)"
          options={typeOptions}
          value={typeOptions.find(opt => opt.value === localFilters.type)}
          onChange={(opt) => handleSelectChange('type', opt)}
          isClearable
        />

        {/* Sorting */}
        <div className="flex items-end space-x-2 col-span-1 md:col-span-1">
            <Select
                id="sortBy" name="sortBy" placeholder="Sort By"
                options={sortOptions}
                value={sortOptions.find(opt => opt.value === sortBy)}
                onChange={handleSortFieldChange}
                className="flex-grow"
            />
            <Button type="button" onClick={toggleSortOrder} variant="ghost" className="p-2 border dark:border-gray-600">
                {sortOrder === 'asc' ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
            </Button>
        </div>


        <div className="flex items-center space-x-2 col-span-full sm:col-span-1 md:col-span-1 lg:col-span-1 justify-end sm:justify-start lg:justify-end">
          <Button type="button" variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)} leftIcon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}>
            {showAdvanced ? 'Hide' : 'More'} Filters
          </Button>
          <Button type="submit" variant="primary" leftIcon={<FunnelIcon className="h-5 w-5" />}>
            Apply
          </Button>
          {(Object.values(localFilters).some(val => val !== '' && val !== null) || sortBy !== 'date' || sortOrder !== 'desc') && (
            <Button type="button" variant="ghost" onClick={handleClearFilters} className="p-2 text-red-500 dark:text-red-400">
              <XMarkIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </form>

      {/* Advanced Filters - Collapsible */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700">
              <Select
                id="category" name="category" placeholder="Category (All)"
                options={categoryOptions}
                value={categoryOptions.find(opt => opt.value === localFilters.category)}
                onChange={(opt) => handleSelectChange('category', opt)}
                isClearable
                isDisabled={categoryOptions.length === 0}
              />
              <div className="relative">
                <DatePicker
                  selected={localFilters.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  selectsStart
                  startDate={localFilters.startDate}
                  endDate={localFilters.endDate}
                  placeholderText="Start Date"
                  className="w-full" // Ensure DatePicker Input uses custom styling via index.css
                  isClearable
                  maxDate={new Date()}
                />
                 <CalendarDaysIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={localFilters.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  selectsEnd
                  startDate={localFilters.startDate}
                  endDate={localFilters.endDate}
                  minDate={localFilters.startDate}
                  placeholderText="End Date"
                  className="w-full"
                  isClearable
                  maxDate={new Date()}
                />
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
               <Input
                id="minAmount" name="minAmount" type="number" placeholder="Min Amount"
                value={localFilters.minAmount} onChange={handleInputChange}
              />
              <Input
                id="maxAmount" name="maxAmount" type="number" placeholder="Max Amount"
                value={localFilters.maxAmount} onChange={handleInputChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionFilters;