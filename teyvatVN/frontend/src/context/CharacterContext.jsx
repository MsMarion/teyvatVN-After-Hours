// src/context/CharacterContext.jsx
import { createContext, useContext, useState } from "react";

/**
 * Character Context
 * 
 * This context is like a global storage box for character data.
 * It allows us to keep track of which characters the user has selected (e.g., "Amber" and "Jean")
 * and share that information across different pages (like CharacterPage and StoryPage)
 * without having to pass it manually through every single component.
 */
const CharacterContext = createContext();

/**
 * CharacterProvider Component
 * 
 * This component wraps around parts of our app that need access to character data.
 * Any component inside this provider can ask for the 'selectedCharacters'.
 */
export function CharacterProvider({ children }) {
  // --- State Management ---
  // 'selectedCharacters' is an array that holds the character objects chosen by the user.
  // Initially, it is an empty array [].
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  return (
    // We pass the state (selectedCharacters) and the function to update it (setSelectedCharacters)
    // down to all children components via the 'value' prop.
    <CharacterContext.Provider value={{ selectedCharacters, setSelectedCharacters }}>
      {children}
    </CharacterContext.Provider>
  );
}

/**
 * Custom Hook: useCharacters
 * 
 * This is a shortcut function for components to easily access the CharacterContext.
 * Instead of writing `useContext(CharacterContext)` every time, they can just write `useCharacters()`.
 */
export function useCharacters() {
  return useContext(CharacterContext);
}

