// client/.eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'react-app', // Base CRA ESLint config (includes react, jsx-a11y, etc.)
    'react-app/jest',
    'plugin:react-hooks/recommended', // Enforces rules of Hooks

    // IMPORTANT: Prettier config must be LAST to override other formatting rules
    'plugin:prettier/recommended', 
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  // You don't need to explicitly list 'react', 'react-hooks', or 'prettier' in plugins
  // if you use 'react-app' and 'plugin:prettier/recommended' as they handle it.
  // plugins: [], 
  rules: {
    // This rule is enabled by 'plugin:prettier/recommended'
    // You can customize Prettier's behavior via a .prettierrc.js file
    'prettier/prettier': ['error', { endOfLine: 'auto' }],

    // --- Rules to relax for quicker build success ---
    
    // CRA's 'react-app' config is usually good.
    // If 'airbnb' was causing too many stylistic clashes, this setup avoids it.

    // Common rules you might want to adjust if still getting errors:
    'import/extensions': 'off', // Allows imports without file extensions
    'import/order': 'warn', // Warns about import order but doesn't fail build

    'no-underscore-dangle': ['warn', { allow: ['_id'] }], // Allow _id for MongoDB
    
    'react/function-component-definition': 'off', // Allows both const Comp = () => {} and function Comp() {}
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }], // Warn if not .jsx for components
    'react/prop-types': 'off', // Disable if not using prop-types

    // Accessibility rules - good to fix, but can be 'warn' to pass build initially
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',

    // Other potentially noisy rules if coming from a stricter config like Airbnb
    'no-shadow': 'warn',
    'no-param-reassign': ['warn', { props: true, ignorePropertyModificationsFor: ['config', 'acc', 'e', 'draft', 'state'] }], // Allow for specific common cases
    'dot-notation': 'warn',

    // You can add 'off' or 'warn' for other specific rules that are blocking your build
    // 'some-other-eslint-rule': 'warn', 
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};