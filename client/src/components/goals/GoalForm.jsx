import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Input from '../common/Input';
import Button from '../common/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDaysIcon, BanknotesIcon, TrophyIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

const GoalForm = ({
  onSubmit,
  initialValues = {
    name: '',
    targetAmount: '',
    currentAmount: '0', // Default current amount to 0
    deadline: null,
    description: '',
  },
  isEditing = false,
  isLoading = false,
}) => {

  const validationSchema = Yup.object({
    name: Yup.string().required('Goal name is required').max(100, 'Max 100 characters'),
    targetAmount: Yup.number()
      .typeError('Target amount must be a number')
      .positive('Target amount must be positive')
      .required('Target amount is required'),
    currentAmount: Yup.number()
      .typeError('Current amount must be a number')
      .min(0, 'Current amount cannot be negative')
      .test(
        'is-less-than-target',
        'Current amount cannot exceed target amount',
        function (value) {
          const { targetAmount } = this.parent;
          // Only validate if both are numbers
          if (typeof value === 'number' && typeof targetAmount === 'number') {
            return value <= targetAmount;
          }
          return true; // Pass if targetAmount is not yet a number (e.g., during initial typing)
        }
      ),
    deadline: Yup.date().nullable().min(new Date(), "Deadline cannot be in the past"),
    description: Yup.string().max(250, 'Max 250 characters'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 md:space-y-6">
      <Input
        id="name" name="name" type="text" label="Goal Name"
        placeholder="e.g., New Laptop, Vacation Fund"
        leftIcon={<TrophyIcon />}
        {...formik.getFieldProps('name')}
        error={formik.touched.name && formik.errors.name}
        touched={formik.touched.name}
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
            id="targetAmount" name="targetAmount" type="number" label="Target Amount (₹)"
            placeholder="0.00"
            leftIcon={<BanknotesIcon />}
            {...formik.getFieldProps('targetAmount')}
            error={formik.touched.targetAmount && formik.errors.targetAmount}
            touched={formik.touched.targetAmount}
            disabled={isLoading}
        />
        <Input
            id="currentAmount" name="currentAmount" type="number" label="Current Amount Saved (₹)"
            placeholder="0.00"
            leftIcon={<BanknotesIcon />}
            {...formik.getFieldProps('currentAmount')}
            error={formik.touched.currentAmount && formik.errors.currentAmount}
            touched={formik.touched.currentAmount}
            disabled={isLoading}
        />
      </div>
      

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          Deadline (Optional)
        </label>
        <div className="relative">
            <DatePicker
                id="deadline"
                selected={formik.values.deadline ? new Date(formik.values.deadline) : null}
                onChange={(date) => formik.setFieldValue('deadline', date)}
                onBlur={() => formik.setFieldTouched('deadline', true)}
                dateFormat="MMMM d, yyyy"
                className="w-full" // Styled globally
                placeholderText="Select a date"
                minDate={new Date()}
                isClearable
                disabled={isLoading}
            />
            <CalendarDaysIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
        {formik.touched.deadline && formik.errors.deadline && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors.deadline}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          Description (Optional)
        </label>
        <div className="relative">
            <textarea
                id="description" name="description" rows="3"
                placeholder="Any extra details about this goal..."
                {...formik.getFieldProps('description')}
                className={`
                    block w-full appearance-none rounded-md border px-3 py-2 
                    placeholder-gray-400 dark:placeholder-gray-500 
                    focus:outline-none sm:text-sm
                    bg-card-light dark:bg-card-dark
                    text-text-light dark:text-text-dark
                    ${formik.touched.description && formik.errors.description
                        ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary-light dark:focus:border-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `} // Basic styling, Input component styling is more detailed
                disabled={isLoading}
            />
             {/* Optional: Add ChatBubbleLeftEllipsisIcon if desired, adjust padding */}
        </div>
        {formik.touched.description && formik.errors.description && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formik.errors.description}</p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !formik.dirty}>
          {isEditing ? 'Save Changes' : 'Set Goal'}
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;