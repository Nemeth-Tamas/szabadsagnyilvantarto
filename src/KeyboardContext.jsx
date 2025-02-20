import { createContext, useContext, useEffect, useState, useRef } from "react";

const KeyboardContext = createContext(null);

export const KeyboardProvider = ({ children }) => {
  const keyHandlersRef = useRef(new Map());
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const handleKeyDown = (event) => {
      const keyCombo = `${event.ctrlKey ? "ctrl+" : ""}${event.altKey ? "alt+" : ""}${event.shiftKey ? "shift+" : ""}${event.key.toLowerCase()}`;
      if (keyHandlersRef.current.has(keyCombo)) {
        keyHandlersRef.current.get(keyCombo)();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onKeyPressed = (keyCombo, callback) => {
    keyHandlersRef.current.set(keyCombo, callback);
  };

  return (
    <KeyboardContext.Provider value={{ onKeyPressed }}>
      {children}
    </KeyboardContext.Provider>
  )
};

export const useKeyboard = () => useContext(KeyboardContext);