// Shared background configuration for frontend and backend
// This ensures consistent naming between AI generation and UI display

export const BACKGROUND_OPTIONS = [
    {
        id: "favonius_cathedral",
        displayName: "Favonius Cathedral",
        description: "The grand cathedral of Mondstadt, a place of worship and solace",
        fileName: "favonius-cathedral.jpg"
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

// Helper function to get background by ID
export function getBackgroundById(id) {
    return BACKGROUND_OPTIONS.find(bg => bg.id === id);
}

// Helper function to get background by display name (for backward compatibility)
export function getBackgroundByName(name) {
    return BACKGROUND_OPTIONS.find(bg => bg.displayName === name);
}

// Get list of background IDs for AI prompt
export function getBackgroundIds() {
    return BACKGROUND_OPTIONS.map(bg => bg.id);
}

// Get list of display names for AI prompt
export function getBackgroundDisplayNames() {
    return BACKGROUND_OPTIONS.map(bg => bg.displayName);
}
