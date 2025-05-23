import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { TagIcon, SwatchIcon } from '@heroicons/react/24/outline';
// You might want a color picker component here, or a simple text input for hex color
// For simplicity, using a text input for color. A visual picker would be better.
// Example: import { TwitterPicker } from 'react-color'; (npm install react-color)

const CategoryForm = ({
  onSubmit,
  initialValues = {
    name: '',
    type: 'expense',
    icon: '', // Placeholder for icon selection (e.g., FontAwesome class name)
    color: '#CCCCCC', // Default color
  },
  isEditing = false,
  isLoading = false,
  existingCategories = [], // To check for name conflicts (custom categories of the user)
}) => {

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Category name is required')
      .max(50, 'Max 50 characters')
      .test('is-unique', 'A custom category with this name and type already exists.', function (value) {
        const { type } = this.parent; // Get the type from form values
        // If editing, allow the current category's name
        if (isEditing && value === initialValues.name && type === initialValues.type) {
            return true;
        }
        // Check against other existing custom categories
        return !existingCategories.some(
          (cat) => cat.name.toLowerCase() === value?.toLowerCase() && cat.type === type
        );
      }),
    type: Yup.string().oneOf(['income', 'expense']).required('Type is required'),
    icon: Yup.string().max(50, 'Max 50 characters for icon name/class'), // Optional for now
    color: Yup.string()
      .matches(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Must be a valid hex color (e.g., #RRGGBB or #RGB)')
      .required('Color is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  const typeOptions = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
  ];

  // TODO: Implement a proper icon picker if desired.
  // For now, it's a text input.
  // const iconOptions = [ { value: 'FaPizzaSlice', label: 'Pizza (Food)' }, ... ];


  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 md:space-y-6">
      <Input
        id="name" name="name" type="text" label="Category Name"
        placeholder="e.g., Groceries, Freelance Project"
        leftIcon={<TagIcon />}
        {...formik.getFieldProps('name')}
        error={formik.touched.name && formik.errors.name}
        touched={formik.touched.name}
        disabled={isLoading}
      />

      <Select
        id="type" name="type" label="Category Type"
        options={typeOptions}
        value={typeOptions.find(opt => opt.value === formik.values.type)}
        onChange={(option) => formik.setFieldValue('type', option.value)}
        onBlur={() => formik.setFieldTouched('type', true)}
        isDisabled={isLoading || isEditing} // Type cannot be changed once set
        // leftIcon equivalent would require customizing Select component further or wrapping
      />
      {isEditing && (
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark -mt-3">
            Category type cannot be changed after creation.
        </p>
      )}


      <Input
        id="icon" name="icon" type="text" label="Icon Name (Optional)"
        placeholder="e.g., FaShoppingCart (FontAwesome)"
        // leftIcon={<SparklesIcon />} // Example icon for "icon field"
        {...formik.getFieldProps('icon')}
        error={formik.touched.icon && formik.errors.icon}
        touched={formik.touched.icon}
        disabled={isLoading}
      />
       <p className="text-xs text-text-muted-light dark:text-text-muted-dark -mt-3">
            Refer to an icon library like Font Awesome (e.g., "FaCar"). Future update could include a visual picker.
        </p>

      <div className="flex items-end space-x-3">
        <Input
            id="color" name="color" type="text" label="Category Color (Hex)"
            placeholder="#RRGGBB"
            leftIcon={<SwatchIcon />}
            {...formik.getFieldProps('color')}
            error={formik.touched.color && formik.errors.color}
            touched={formik.touched.color}
            className="flex-grow"
            disabled={isLoading}
        />
        <div 
            className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 mb-1" // mb-1 to align with input bottom due to error message space
            style={{ backgroundColor: formik.values.color && formik.getFieldMeta('color').error === undefined ? formik.values.color : 'transparent' }}
            title="Color Preview"
        ></div>
      </div>
      {/* If using react-color:
      <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Category Color</label>
      <TwitterPicker
          color={formik.values.color}
          onChangeComplete={(colorResult) => formik.setFieldValue('color', colorResult.hex)}
          triangle="hide"
          colors={['#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF']}
      />
      */}


      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !formik.dirty}>
          {isEditing ? 'Save Changes' : 'Add Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;