import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext({
  theme: 'system', // 'light', 'dark', 'system'
  actualTheme: 'light', // 'light' or 'dark' based on system/time
  setTheme: () => {},
  toggleTheme: () => {}, // Manual override toggle
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const storedTheme = localStorage.getItem('appTheme');
    return storedTheme || 'system'; // Default to system preference
  });

  const [actualTheme, setActualTheme] = useState('light');

  const applyTheme = useCallback((chosenTheme) => {
    let currentActualTheme = 'light'; // Default to light

    if (chosenTheme === 'light') {
      currentActualTheme = 'light';
    } else if (chosenTheme === 'dark') {
      currentActualTheme = 'dark';
    } else { // 'system'
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const hour = new Date().getHours();
      const isNightTime = hour < 6 || hour >= 18; // 6 PM to 6 AM is night

      if (systemPrefersDark || isNightTime) { // Prioritize system dark, then time
        currentActualTheme = 'dark';
      } else {
        currentActualTheme = 'light';
      }
    }

    setActualTheme(currentActualTheme);
    const root = window.document.documentElement;
    root.classList.remove(currentActualTheme === 'light' ? 'dark' : 'light');
    root.classList.add(currentActualTheme);
    localStorage.setItem('appTheme', chosenTheme); // Store user's choice (light, dark, or system)
  }, []);


  useEffect(() => {
    applyTheme(theme);

    // Listener for system preference changes if theme is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    // Interval to check time if theme is 'system' (less critical if system preference is main driver)
    let timeCheckInterval;
    if (theme === 'system') {
        timeCheckInterval = setInterval(() => {
            applyTheme('system');
        }, 60 * 1000 * 5); // Check every 5 minutes
    }


    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      if (timeCheckInterval) clearInterval(timeCheckInterval);
    };
  }, [theme, applyTheme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme); // This will trigger the useEffect
  };

  const toggleTheme = () => { // For manual override button
    if (actualTheme === 'light') {
      setThemeState('dark'); // Directly set to dark, overrides system/time
    } else {
      setThemeState('light'); // Directly set to light
    }
  };


  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};