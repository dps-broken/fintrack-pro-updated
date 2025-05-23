// client/src/setupTests.js

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Optional: If you need to mock global objects or set up other test-specific configurations

// Example: Mock localStorage for tests
// const localStorageMock = (function () {
//   let store = {};
//   return {
//     getItem(key) {
//       return store[key] || null;
//     },
//     setItem(key, value) {
//       store[key] = value.toString();
//     },
//     removeItem(key) {
//       delete store[key];
//     },
//     clear() {
//       store = {};
//     },
//   };
// })();
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Example: Mock IntersectionObserver (often needed for components that use it for lazy loading, etc.)
// global.IntersectionObserver = class IntersectionObserver {
//   constructor(callback, options) {
//     this.callback = callback;
//     this.options = options;
//   }
//   observe(target) {
//     // Simulate an intersection immediately or after a timeout for testing
//     // this.callback([{ isIntersecting: true, target }]);
//   }
//   unobserve() {}
//   disconnect() {}
// };


// Example: Mock window.matchMedia (useful for testing responsive components or theme switching)
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation(query => ({
//     matches: false, // Default behavior
//     media: query,
//     onchange: null,
//     addListener: jest.fn(), // Deprecated
//     removeListener: jest.fn(), // Deprecated
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });


// Suppress console.error for specific expected errors during tests (use with caution)
// let originalError;
// beforeEach(() => {
//   originalError = console.error;
//   console.error = (...args) => {
//     if (typeof args[0] === 'string' && args[0].includes('Your expected error message part')) {
//       return;
//     }
//     originalError(...args);
//   };
// });
// afterEach(() => {
//   console.error = originalError;
// });