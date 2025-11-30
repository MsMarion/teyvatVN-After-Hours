// src/data/characterData.js

// --- Import all the images you will need ---

// Card Images (for the character selection page)

import albedoCard from "../assets/character-sprites/albedo.webp";
import amberCard from "../assets/character-sprites/amber.webp";
import barbaraCard from "../assets/character-sprites/barbara.webp";
import dahliaCard from "../assets/character-sprites/dahlia.webp";
import dilucCard from "../assets/character-sprites/diluc.webp";
import eulaCard from "../assets/character-sprites/eula.webp";
import fischlCard from "../assets/character-sprites/fischl.webp";
import jeanCard from "../assets/character-sprites/jean.png";
import kaeyaCard from "../assets/character-sprites/kaeya.png";
import keqingCard from "../assets/character-sprites/keqing.png";
import lisaCard from "../assets/character-sprites/lisa.webp";
import monaCard from "../assets/character-sprites/mona.webp";
import noelleCard from "../assets/character-sprites/noelle.webp";
import rosariaCard from "../assets/character-sprites/rosaria.webp";
import sucroseCard from "../assets/character-sprites/sucrose.png";
import ventiCard from "../assets/character-sprites/venti.webp";

// Story Sprites (for the story page)
// You will need to create and add these new image files to your assets folder
import kaeyaNeutral from "../assets/character-sprites/Kaeya-Neutral.png";
import jeanNeutral from "../assets/character-sprites/Jean-Neutral.png";
import dilucNeutral from "../assets/character-sprites/Diluc-Neutral.png";

// --- The Character Database ---
// This object maps a character's name to all their data.
export const characterDatabase = {
  // Each key MUST EXACTLY match the 'name' from your allCharacters array
  Diluc: {
    cardImage: dilucCard,
    storySprites: {
      Neutral: dilucNeutral,
    },
    // You can add other data like bio, element, etc. here in the future
  },
  Kaeya: {
    cardImage: kaeyaCard,
    storySprites: {
      Neutral: kaeyaNeutral,
    },
    // You can add other data like bio, element, etc. here in the future
  },
  Jean: {
    cardImage: jeanCard,
    storySprites: {
      Neutral: jeanNeutral,
    },
  },
  Keqing: {
    cardImage: keqingCard,
    storySprites: {
      Neutral: keqingCard, // Using card as a placeholder, replace with actual sprite
    },
  },
  Sucrose: {
    cardImage: sucroseCard,
    storySprites: {
      Neutral: sucroseCard, // Using card as a placeholder
    },
  },
  Amber: {
    cardImage: amberCard,
    storySprites: {
      Neutral: amberCard, // Using card as a placeholder
    },
  },
  Barbara: {
    cardImage: barbaraCard,
    storySprites: {
      Neutral: barbaraCard, // Using card as a placeholder
    },
  },
  // --- Add all other characters below in the same format ---
};
