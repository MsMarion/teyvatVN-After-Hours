// src/context/CharacterContext.jsx
import { createContext, useContext, useState } from "react";

/**
 * Character Context
 * 
 * Manages the state of selected characters in the application.
 * This allows character selection to persist across different pages/components.
 */
const CharacterContext = createContext();

export function CharacterProvider({ children }) {
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  return (
    <CharacterContext.Provider value={{ selectedCharacters, setSelectedCharacters }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters() {
  return useContext(CharacterContext);
}

