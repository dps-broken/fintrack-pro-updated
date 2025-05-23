import React from 'react';
import ReactSelect, { components } from 'react-select';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';

const CustomDropdownIndicator = props => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    </components.DropdownIndicator>
  );
};

const CustomClearIndicator = props => {
  return (
    <components.ClearIndicator {...props}>
      <XMarkIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
    </components.ClearIndicator>
  );
};

const Select = ({
  id,
  name,
  options, // Array of { value: any, label: string, ...otherProps }
  value,   // Selected option object or array of option objects for multi-select
  onChange, // (selectedOptionOrOptions) => void
  onBlur,
  placeholder = 'Select...',
  label,
  error,
  touched,
  isMulti = false,
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  className = '', // For the wrapper div
  menuPlacement = 'auto', // 'auto', 'bottom', 'top'
  ...props
}) => {
  const hasError = touched && error;

  // Custom styles for react-select to match Tailwind theme
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--select-bg, transparent)', // Use CSS vars for theme adaptability
      borderColor: hasError ? 'var(--color-red-500)' : (state.isFocused ? 'var(--color-primary)' : 'var(--color-border)'),
      boxShadow: state.isFocused ? `0 0 0 1px var(--color-primary)` : (hasError ? `0 0 0 1px var(--color-red-500)` : 'none'),
      borderRadius: '0.375rem', // rounded-md
      minHeight: '38px',
      '&:hover': {
        borderColor: hasError ? 'var(--color-red-500)' : 'var(--color-primary)',
      },
      color: 'var(--color-text)',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 8px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--color-text)',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'var(--color-primary-muted)',
      color: 'var(--color-primary-text)',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'var(--color-primary-text)',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'var(--color-primary-text)',
      '&:hover': {
        backgroundColor: 'var(--color-primary-darker)',
        color: 'white',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--color-text)',
      margin: '0px', // Fix for alignment
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--color-text-muted)',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--select-menu-bg, white)',
      borderColor: 'var(--color-border)',
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // shadow-lg
      zIndex: 50, // Ensure menu is on top
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--color-primary)' : state.isFocused ? 'var(--color-bg-hover)' : 'transparent',
      color: state.isSelected ? 'var(--color-primary-text-selected)' : 'var(--color-text)',
      '&:active': {
        backgroundColor: !state.isDisabled ? (state.isSelected ? 'var(--color-primary)' : 'var(--color-bg-active)') : undefined,
      },
    }),
    // Add more style overrides as needed for indicators, etc.
    indicatorSeparator: () => ({ display: 'none' }), // Hide the default separator
  };

  // Define CSS variables based on theme (can be done in a useEffect if theme changes dynamically or in global CSS)
  // For simplicity, embedding basic theme logic here. A better way is global CSS vars.
  // These should align with your tailwind.config.js and index.css for dark/light themes.
  const themeVariables = {
    // These are simplified; true theming would use Tailwind's dark: prefix or CSS variables set by ThemeContext
    '--select-bg': 'bg-card-light dark:bg-card-dark', // Not directly usable in JS like this
    '--select-menu-bg': 'bg-card-light dark:bg-card-dark',
    '--color-text': '#34495e', // text-light
    '--color-text-muted': '#7f8c8d', // text-muted-light
    '--color-border': '#d1d5db', // gray-300
    '--color-primary': '#3498db', // primary-light
    '--color-red-500': '#ef4444',
    '--color-primary-muted': '#e0f2fe', // A light primary shade
    '--color-primary-text': '#1e40af', // Text for primary muted bg
    '--color-primary-text-selected': '#ffffff',
    '--color-bg-hover': '#f3f4f6', // gray-100
    '--color-bg-active': '#e5e7eb', // gray-200
  };
  // In a real app, these CSS variables should be defined in your global CSS and toggled by the 'dark' class on <html>

  return (
    <div className={`w-full ${className}`} /* style={themeVariables} -- this is not how CSS vars are applied to children in JS */ >
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          {label}
        </label>
      )}
      <ReactSelect
        inputId={id || name}
        name={name}
        options={options}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        isMulti={isMulti}
        isClearable={isClearable && !isDisabled}
        isDisabled={isDisabled}
        isLoading={isLoading}
        menuPlacement={menuPlacement}
        components={{ DropdownIndicator: CustomDropdownIndicator, ClearIndicator: CustomClearIndicator }}
        // Use classNamePrefix to target react-select elements with global CSS (from index.css)
        classNamePrefix="react-select"
        // styles={customStyles} // Use this if you want JS-based styling
        unstyled // Use this if you want to rely purely on classNamePrefix and global CSS for styling
        {...props}
      />
      {hasError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Select;