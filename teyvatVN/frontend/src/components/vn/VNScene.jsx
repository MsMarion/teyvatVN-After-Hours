import React from "react";
import VNTextBox from "./VNTextBox";
import { characterDatabase } from "../../data/characterData.js";
import quillIcon from "../../assets/images/quill.png";
import "../../styles/StoryPage.css"; // Reuse existing styles for now

/**
 * VNScene Component
 * 
 * This component is the "stage" of our Visual Novel. It handles rendering:
 * 1. The background image.
 * 2. The character sprites (images of the characters).
 * 3. The text box overlay (where dialogue appears).
 * 
 * It is designed to be reusable in two different contexts:
 * 
 * 1. **Story Mode (Play Page)**: 
 *    - It receives a full `story` object containing all segments.
 *    - The `VNTextBox` child component handles its own navigation (Next/Prev) internally.
 * 
 * 2. **Controlled Mode (Editor Page)**:
 *    - It receives a specific `currentSegment` and `characters` list from the parent.
 *    - Navigation is controlled externally via `onNext` and `onPrev` callbacks.
 *    - This allows the Editor to show a live preview of exactly what is being edited.
 */
export default function VNScene({
    // --- Props ---
    story,              // The full story object (used in Story Mode)

    // Controlled Mode Props (used in Editor Mode)
    characters,         // List of character names to display
    currentSegment,     // The specific dialogue/narration segment to show right now
    onNext,             // Function to call when user clicks "Next"
    onPrev,             // Function to call when user clicks "Prev"
    currentIndex,       // Current segment number (for display, e.g., "1/10")
    totalSegments,      // Total number of segments

    // Appearance Props
    backgroundImage,    // URL of the background image to display
    isFullscreen,       // Boolean: is the scene currently taking up the whole screen?
    onToggleFullscreen, // Function to switch to fullscreen
    onExitFullscreen,   // Function to exit fullscreen
}) {
    // Determine which list of characters to show.
    // In Story Mode, we get them from `story.characters`.
    // In Editor Mode, we get them from the `characters` prop.
    const characterList = story?.characters || characters;

    // Check if we have enough data to render the scene.
    const hasContent = !!(characterList || story);

    return (
        <div className={`vn-fullscreen-wrapper ${isFullscreen ? 'fullscreen-active' : ''}`}>
            {/* Exit Fullscreen Button - Only visible when in fullscreen mode */}
            {isFullscreen && (
                <button
                    className="fullscreen-exit-btn"
                    onClick={onExitFullscreen}
                    title="Exit Fullscreen (ESC)"
                >
                    ✕ Exit Fullscreen
                </button>
            )}

            {/* Main Scene Container */}
            <section
                className={`visual-novel-ui ${isFullscreen ? 'fullscreen' : ''}`}
                style={{
                    // Set the background image dynamically
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                }}
            >
                {!hasContent ? (
                    // --- Placeholder State ---
                    // Shown when no story or characters are loaded yet.
                    <div className="vn-placeholder">
                        <img src={quillIcon} alt="Waiting for story..." className="vn-placeholder-icon" />
                        <p>Your story will appear here...</p>
                    </div>
                ) : (
                    // --- Active Scene State ---
                    <>
                        {/* Debug label if no background is selected */}
                        {!backgroundImage && <span className="debug-bg-label">Visual novel UI</span>}

                        {/* Fullscreen Toggle Button - Only visible when NOT in fullscreen */}
                        {!isFullscreen && onToggleFullscreen && (
                            <button
                                className="fullscreen-toggle-btn"
                                onClick={onToggleFullscreen}
                                title="Enter Fullscreen"
                            >
                                ⛶ Fullscreen
                            </button>
                        )}

                        {/* Character Sprites Rendering */}
                        {characterList &&
                            characterList.map((charName, index) => {
                                // Look up character data (images, etc.) from our database
                                const charData = characterDatabase[charName];
                                // Use the first available story sprite for now
                                const storySprite = charData
                                    ? Object.values(charData.storySprites)[0]
                                    : null;

                                if (!storySprite) return null;

                                return (
                                    <img
                                        key={charName}
                                        src={storySprite}
                                        alt={charName}
                                        // 'pos-1' puts the first character on the left
                                        // 'pos-2' puts the second character on the right
                                        className={`character-sprite pos-${index + 1}`}
                                    />
                                );
                            })}

                        {/* Visual Novel Text Box Overlay */}
                        {/* This component handles displaying the actual text and speaker names */}
                        <VNTextBox
                            segments={story?.segments} // Pass all segments if in Story Mode
                            segment={currentSegment}   // Pass single segment if in Controlled Mode
                            onNext={onNext}
                            onPrev={onPrev}
                            currentIndex={currentIndex}
                            totalSegments={totalSegments}
                            // If 'currentSegment' is provided, we are in 'embedded' (Editor) mode
                            embedded={!!currentSegment}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
