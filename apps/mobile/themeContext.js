import React, { createContext, useContext, useState } from 'react';
import { themes } from './theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('default');
  const value = {
    theme: themes[themeName],
    setTheme: setThemeName,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
