// src/context/CharacterContext.jsx
import { createContext, useContext, useState } from "react";

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

