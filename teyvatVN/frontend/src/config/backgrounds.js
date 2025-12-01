/**
 * Background Configuration
 * 
 * This file defines the list of available backgrounds for our Visual Novel.
 * It serves as a "single source of truth" so that both the UI (BackgroundSelector)
 * and the logic (AI generation) know what backgrounds exist.
 */

export const BACKGROUND_OPTIONS = [
    {
        id: "favonius_cathedral",   // Unique internal ID (used in code)
        displayName: "Favonius Cathedral", // Human-readable name (shown to user)
        description: "The grand cathedral of Mondstadt, a place of worship and solace",
        fileName: "favonius-cathedral.jpg" // The actual image file name in assets folder
    },
    {
        id: "mondstadt_night",
        displayName: "Mondstadt Night",
        description: "The city of Mondstadt under the stars",
        fileName: "mondstadt-night.webp"
    },
    {
        id: "statue_of_seven",
        displayName: "Statue of the Seven",
        description: "A statue dedicated to the Anemo Archon",
        fileName: "statue-of-seven-day.png"
    },
    {
        id: "angels_share",
        displayName: "Angel's Share",
        description: "Diluc's tavern, a popular gathering spot",
        fileName: "goodNews.jpg" // Using existing asset as placeholder
    }
];

// --- Helper Functions ---
// These little functions make it easier to find specific background info
// without writing the same loop code over and over again.

/**
 * Finds a background object using its unique ID.
 * Example: getBackgroundById("favonius_cathedral") -> returns the full object
 */
export function getBackgroundById(id) {
    return BACKGROUND_OPTIONS.find(bg => bg.id === id);
}

/**
 * Finds a background object using its display name.
 * Useful if the AI returns "Favonius Cathedral" instead of the ID.
 */
export function getBackgroundByName(name) {
    return BACKGROUND_OPTIONS.find(bg => bg.displayName === name);
}

/**
 * Returns a simple list of just the IDs.
 * Useful for validation or sending options to the AI.
 * Example: ["favonius_cathedral", "mondstadt_night", ...]
 */
export function getBackgroundIds() {
    return BACKGROUND_OPTIONS.map(bg => bg.id);
}

/**
 * Returns a simple list of just the display names.
 */
export function getBackgroundDisplayNames() {
    return BACKGROUND_OPTIONS.map(bg => bg.displayName);
}
