// src/themeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  default: {
    primary: '#2E7D32',
    background: '#FFFFFF',
    backgroundImage: "url('/default-background.jpg')",
    text: '#333333',
    card: '#F1F8E9',
    font: 'Poppins, sans-serif',
  },
  cafe: {
    primary: '#A1887F',
    background: '#FFF8E1',
    backgroundImage: "url('/cafe-background.avif')",
    text: '#3E2723',
    card: '#f7e0bfff',
    font: 'Georgia, serif',
  },
  fineDining: {
    primary: '#212121',
    background: '#FAF8F4',
    backgroundImage: "url('/fine-dining-background.avif')",
    text: '#BFA181',
    card: '#F5F5F5',
    font: 'PlayfairDisplay-Regular, serif',
  },
};


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const storedTheme = localStorage.getItem('selectedTheme');
  const [themeName, setThemeName] = useState(storedTheme || 'default');

  useEffect(() => {
    localStorage.setItem('selectedTheme', themeName);
  }, [themeName]);

  const value = {
    theme: themes[themeName],
    setThemeName,
    themeName,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
