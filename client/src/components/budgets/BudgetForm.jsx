import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDaysIcon, BanknotesIcon, TagIcon, IdentificationIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const BudgetForm = ({
  onSubmit,
  initialValues = {
    name: '',
    category: null, // null for global budget, category ID for specific
    amount: '',
    period: 'monthly',
    startDate: new Date(new Date().setDate(1)), // Default to start of current month
    endDate: null, // Optional, for custom period
    notificationsEnabled: true,
  },
  categories, // Expense categories { _id, name }
  isEditing = false,
  isLoading = false,
}) => {

  const validationSchema = Yup.object({
    name: Yup.string().required('Budget name is required').max(100, 'Max 100 characters'),
    category: Yup.string().nullable(), // Can be null for global budget
    amount: Yup.number()
      .typeError('Amount must be a number')
      .positive('Amount must be positive')
      .required('Amount is required'),
    period: Yup.string().oneOf(['monthly', 'yearly', 'custom']).required('Period is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date().nullable().when('period', {
      is: 'custom',
      then: (schema) => schema.required('End date is required for custom period')
                               .min(Yup.ref('startDate'), "End date can't be before start date"),
      otherwise: (schema) => schema.nullable(),
    }),
    notificationsEnabled: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const categoryOptions = [
    { value: null, label: 'Overall Expenses (Global)' }, // Option for global budget
    ...categories.map(cat => ({ value: cat._id, label: cat.name }))
  ];


  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 md:space-y-6">
      <Input
        id="name" name="name" type="text" label="Budget Name"
        placeholder="e.g., Monthly Food, Vacation Savings"
        leftIcon={<IdentificationIcon />}
        {...formik.getFieldProps('name')}
        error={formik.touched.name && formik.errors.name}
        touched={formik.touched.name}
        disabled={isLoading}
      />

      <Select
        id="category" name="category" label="Category (Optional)"
        options={categoryOptions}
        value={categoryOptions.find(opt => opt.value === formik.values.category)}
        onChange={(option) => formik.setFieldValue('category', option ? option.value : null)}
        onBlur={() => formik.setFieldTouched('category', true)}
        placeholder="Select category or leave for Overall"
        isClearable // To allow clearing to 'null' for global
        isDisabled={isLoading}
        // leftIcon={<TagIcon />} // Select component doesn't directly support leftIcon prop like Input
      />

      <Input
        id="amount" name="amount" type="number" label="Budget Amount (₹)"
        placeholder="0.00"
        leftIcon={<BanknotesIcon />}
        {...formik.getFieldProps('amount')}
        error={formik.touched.amount && formik.errors.amount}
        touched={formik.touched.amount}
        disabled={isLoading}
      />

      <Select
        id="period" name="period" label="Budget Period"
        options={periodOptions}
        value={periodOptions.find(opt => opt.value === formik.values.period)}
        onChange={(option) => formik.setFieldValue('period', option.value)}
        onBlur={() => formik.setFieldTouched('period', true)}
        isDisabled={isLoading}
      />
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
            Start Date
            </label>
            <div className="relative">
                <DatePicker
                    id="startDate"
                    selected={formik.values.startDate ? new Date(formik.values.startDate) : null}
                    onChange={(date) => formik.setFieldValue('startDate', date)}
                    onBlur={() => formik.setFieldTouched('startDate', true)}
                    dateFormat="MMMM d, yyyy"
                    className="w-full" // Styled globally via index.css
                    disabled={isLoading}
                    selectsStart
                    startDate={formik.values.startDate ? new Date(formik.values.startDate) : null}
                    endDate={formik.values.endDate ? new Date(formik.values.endDate) : null}
                />
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            {formik.touched.startDate && formik.errors.startDate && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors.startDate}</p>
            )}
        </div>

        {formik.values.period === 'custom' && (
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                End Date
                </label>
                <div className="relative">
                    <DatePicker
                        id="endDate"
                        selected={formik.values.endDate ? new Date(formik.values.endDate) : null}
                        onChange={(date) => formik.setFieldValue('endDate', date)}
                        onBlur={() => formik.setFieldTouched('endDate', true)}
                        dateFormat="MMMM d, yyyy"
                        className="w-full"
                        disabled={isLoading}
                        selectsEnd
                        startDate={formik.values.startDate ? new Date(formik.values.startDate) : null}
                        endDate={formik.values.endDate ? new Date(formik.values.endDate) : null}
                        minDate={formik.values.startDate ? new Date(formik.values.startDate) : null}
                    />
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                {formik.touched.endDate && formik.errors.endDate && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors.endDate}</p>
                )}
            </div>
        )}
      </div>


      <div className="flex items-center justify-between pt-2">
        <label htmlFor="notificationsEnabled" className="flex items-center text-sm text-text-light dark:text-text-dark">
          <input
            type="checkbox"
            id="notificationsEnabled"
            name="notificationsEnabled"
            checked={formik.values.notificationsEnabled}
            onChange={formik.handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-dark dark:ring-offset-background-dark mr-2"
            disabled={isLoading}
          />
          Enable Breach Notifications
          <BellAlertIcon className="h-4 w-4 text-gray-500 ml-1" />
        </label>
      </div>


      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !formik.dirty}>
          {isEditing ? 'Save Changes' : 'Set Budget'}
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;