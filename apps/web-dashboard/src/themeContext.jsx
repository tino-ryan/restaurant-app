// src/themeContext.js
import React, { createContext, useContext, useState } from 'react';

const themes = {
  default: {
    primary: '#E53935',
    background: '#FFFFFF',
    text: '#333333',
    card: '#FFF5F5',
    font: 'System',
  },
  cafe: {
    primary: '#A1887F',
    background: '#FFF8E1',
    text: '#3E2723',
    card: '#FFE0B2',
    font: 'Georgia',
  },
  fineDining: {
    primary: '#212121',
    background: '#FAF8F4',
    text: '#BFA181',
    card: '#F5F5F5',
    font: 'PlayfairDisplay-Regular',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('default');

  const value = {
    theme: themes[themeName],
    setThemeName,
    themeName,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
