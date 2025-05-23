// client/src/components/transactions/TransactionForm.jsx
import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDaysIcon, BanknotesIcon, TagIcon, ChatBubbleLeftEllipsisIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const TransactionForm = ({
  onSubmit,
  initialValues = {
    type: 'expense',
    amount: '',
    category: '',
    sourceDestination: '',
    date: new Date(),
    notes: '',
  },
  categories = [], // <<<----- ADD DEFAULT EMPTY ARRAY HERE
  isEditing = false,
  isLoading = false,
}) => {

  const validationSchema = Yup.object({
    type: Yup.string().oneOf(['income', 'expense']).required('Type is required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .positive('Amount must be positive')
      .required('Amount is required'),
    category: Yup.string().required('Category is required'),
    sourceDestination: Yup.string().required('Source/Destination is required').max(100, 'Max 100 characters'),
    date: Yup.date().required('Date is required').max(new Date(), "Date cannot be in the future"),
    notes: Yup.string().max(250, 'Max 250 characters'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  // Filter categories based on selected transaction type
  // Add a guard clause to ensure categories is an array
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat) => cat.type === formik.values.type)
                .map(cat => ({ value: cat._id, label: cat.name, icon: cat.icon, color: cat.color }))
    : []; // Default to empty array if categories is not an array (e.g., undefined)


  // Auto-select first category logic
  useEffect(() => {
    // Ensure categories is an array and has items before proceeding
    if (formik.values.type && Array.isArray(categories) && categories.length > 0) {
        const currentCategoryIsValidForType = filteredCategories.some(cat => cat.value === formik.values.category);
        
        if (!formik.values.category || !currentCategoryIsValidForType) {
            if (filteredCategories.length > 0) {
                // Optional: Auto-select first valid category
                // formik.setFieldValue('category', filteredCategories[0].value);
            } else {
                formik.setFieldValue('category', '');
                 if(formik.values.type && formik.touched.type) {
                    toast.info(`No ${formik.values.type} categories available. Please add one first.`);
                 }
            }
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.type, categories, filteredCategories]); // Added filteredCategories to dependency array, formik is stable


  const categoryOptionRenderer = (option) => (
    <div className="flex items-center">
      {option.label}
    </div>
  );

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 md:space-y-6">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Type</label>
        <div className="flex space-x-2">
          {['expense', 'income'].map((type) => (
            <Button
              key={type}
              type="button"
              onClick={() => formik.setFieldValue('type', type)}
              variant={formik.values.type === type ? 'primary' : 'ghost'}
              className={`flex-1 capitalize ${formik.values.type === type ? '' : 'border-gray-300 dark:border-gray-600'}`}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <Input
        id="amount"
        name="amount"
        type="number"
        label="Amount (₹)"
        placeholder="0.00"
        leftIcon={<BanknotesIcon />}
        {...formik.getFieldProps('amount')}
        error={formik.touched.amount && formik.errors.amount}
        touched={formik.touched.amount}
        disabled={isLoading}
      />

      <Select
        id="category"
        name="category"
        label="Category"
        options={filteredCategories}
        value={filteredCategories.find(opt => opt.value === formik.values.category)}
        onChange={(option) => formik.setFieldValue('category', option ? option.value : '')}
        onBlur={() => formik.setFieldTouched('category', true)}
        placeholder="Select a category..."
        error={formik.touched.category && formik.errors.category}
        touched={formik.touched.category}
        isDisabled={isLoading || filteredCategories.length === 0}
        getOptionLabel={(option) => categoryOptionRenderer(option)}
        formatOptionLabel={categoryOptionRenderer}
      />

      <Input
        id="sourceDestination"
        name="sourceDestination"
        type="text"
        label={formik.values.type === 'income' ? 'Source (e.g., Salary, Client)' : 'Merchant/Destination (e.g., Swiggy, Rent)'}
        placeholder={formik.values.type === 'income' ? "e.g., Monthly Salary" : "e.g., Coffee Shop"}
        leftIcon={<BuildingStorefrontIcon />}
        {...formik.getFieldProps('sourceDestination')}
        error={formik.touched.sourceDestination && formik.errors.sourceDestination}
        touched={formik.touched.sourceDestination}
        disabled={isLoading}
      />

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          Date
        </label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <DatePicker
                id="date"
                selected={formik.values.date ? new Date(formik.values.date) : null}
                onChange={(date) => formik.setFieldValue('date', date)}
                onBlur={() => formik.setFieldTouched('date', true)}
                dateFormat="MMMM d, yyyy"
                className={`
                    block w-full appearance-none rounded-md border px-3 py-2 pl-10
                    placeholder-gray-400 dark:placeholder-gray-500 
                    focus:outline-none sm:text-sm
                    bg-card-light dark:bg-card-dark
                    text-text-light dark:text-text-dark
                    ${formik.touched.date && formik.errors.date
                        ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                maxDate={new Date()}
                disabled={isLoading}
                autoComplete="off"
            />
        </div>
        {formik.touched.date && formik.errors.date && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors.date}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          Notes (Optional)
        </label>
        <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 top-0 flex items-center pl-3 pt-2">
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <textarea
                id="notes"
                name="notes"
                rows="3"
                placeholder="Any additional details..."
                {...formik.getFieldProps('notes')}
                className={`
                    block w-full appearance-none rounded-md border px-3 py-2 pl-10
                    placeholder-gray-400 dark:placeholder-gray-500 
                    focus:outline-none sm:text-sm
                    bg-card-light dark:bg-card-dark
                    text-text-light dark:text-text-dark
                    ${formik.touched.notes && formik.errors.notes
                        ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={isLoading}
            />
        </div>
        {formik.touched.notes && formik.errors.notes && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors.notes}</p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !formik.dirty}>
          {isEditing ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;