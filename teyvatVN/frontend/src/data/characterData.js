// src/data/characterData.js

/**
 * Character Data Database
 * 
 * This file acts as a central database for all character-related assets.
 * It maps character names to their corresponding images (both for the selection card and the story sprites).
 * 
 * Structure:
 * - Imports: We import all the image files at the top.
 * - characterDatabase: A big object where the key is the character's name.
 */

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
// These are the images that appear on screen during the visual novel.
// Ideally, you would have different sprites for different emotions (Happy, Sad, Angry).
import kaeyaNeutral from "../assets/character-sprites/Kaeya-Neutral.png";
import jeanNeutral from "../assets/character-sprites/Jean-Neutral.png";
import dilucNeutral from "../assets/character-sprites/Diluc-Neutral.png";

// --- The Character Database ---
export const characterDatabase = {
  // Each key MUST EXACTLY match the 'name' used in your character list (e.g., in CharacterContext or characters.js)

  Diluc: {
    cardImage: dilucCard, // The image shown on the "Select Character" screen
    storySprites: {
      // A dictionary of sprites for different emotions.
      // "Neutral" is the default fallback if no specific emotion is requested.
      Neutral: dilucNeutral,
    },
  },

  Kaeya: {
    cardImage: kaeyaCard,
    storySprites: {
      Neutral: kaeyaNeutral,
    },
  },

  Jean: {
    cardImage: jeanCard,
    storySprites: {
      Neutral: jeanNeutral,
    },
  },

  // For characters where we don't have specific story sprites yet, 
  // we are reusing the card image as a placeholder.
  Keqing: {
    cardImage: keqingCard,
    storySprites: {
      Neutral: keqingCard,
    },
  },

  Sucrose: {
    cardImage: sucroseCard,
    storySprites: {
      Neutral: sucroseCard,
    },
  },

  Amber: {
    cardImage: amberCard,
    storySprites: {
      Neutral: amberCard,
    },
  },

  Barbara: {
    cardImage: barbaraCard,
    storySprites: {
      Neutral: barbaraCard,
    },
  },

  // Note: Any character NOT listed here will likely show a broken image or default placeholder in the app.
};
