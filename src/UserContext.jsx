import React, { useEffect, useState } from "react";

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // TODO: Store JWT in cookie, and reload it on reload
  // TODO: Set the user to the username from the jwt, and handle everything with username, but on request to superior, send jwt.

  const login = (username, password) => {
    let error = true;
    // TODO: Handle user authentication with api
    if (username == "admin" && password == "admin") {
      error = false;
    } else { 
      error = true;
    }
    if (error) {
      throw new Error("Sikertelen bejelentkezés")
    } else {
      setIsLoggedIn(true);
      return true;
    }
  }

  const logout = () => {
    setIsLoggedIn(false);
  }

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout }} >
      {children}
    </UserContext.Provider>
  )
}