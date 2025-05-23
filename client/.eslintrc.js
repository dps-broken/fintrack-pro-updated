// client/.eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'airbnb', // Or another style guide like 'standard'
    'plugin:prettier/recommended', // Integrates Prettier with ESLint
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'prettier', 'jsx-a11y', 'import'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }], // Or your prettier config
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+ new JSX transform
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/prop-types': 'off', // Use TypeScript or PropTypes explicitly if needed
    'import/prefer-default-export': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'jsx-a11y/anchor-is-valid': 'warn', // Or 'off' if using Next.js Link component often
    'react/jsx-props-no-spreading': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Add any project-specific rules
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
};