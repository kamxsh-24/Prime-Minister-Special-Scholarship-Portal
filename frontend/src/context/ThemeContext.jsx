import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('pmsss_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'light';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('pmsss_font_size') || 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
    localStorage.setItem('pmsss_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-normal', 'font-large');
    if (fontSize === 'small') {
      root.classList.add('font-small');
    } else if (fontSize === 'large') {
      root.classList.add('font-large');
    } else {
      root.classList.add('font-normal');
    }
    localStorage.setItem('pmsss_font_size', fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
