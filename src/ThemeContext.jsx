import React, { useEffect, useState } from "react";

export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light")
  const [user, setUser] = useState("")

  const loadThemeFromStorage = () => {
    const loadedTheme = localStorage.getItem('theme');

    if (!loadedTheme) {
      localStorage.setItem('theme', theme);
    } else {
      setTheme(loadedTheme);
    }
  }

  const changeTheme = (newTheme) => {
    if (newTheme == 'light' || newTheme == 'dark') {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    } else {
      throw new Error("Theme not light or dark: " + newTheme);
    }
  }

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, user, setUser }} >
      {children}
    </ThemeContext.Provider>
  )
}