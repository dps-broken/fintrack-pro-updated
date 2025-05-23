// client/.prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true, // This will make Prettier prefer single quotes
  printWidth: 100,    // Increased slightly for potentially longer lines in React
  tabWidth: 2,
  endOfLine: 'auto', // Handles CRLF/LF issues between OS
  jsxSingleQuote: true, // Use single quotes in JSX attributes too
  bracketSpacing: true,
  arrowParens: 'always', // Always include parens around arrow function params e.g. (param) => {}
};