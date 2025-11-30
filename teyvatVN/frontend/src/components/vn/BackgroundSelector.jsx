import React from "react";

/**
 * BackgroundSelector Component
 * 
 * A simple UI component that displays a grid of available background images.
 * It allows the user to click on one to select it for their story.
 */
export default function BackgroundSelector({
    // --- Props ---
    backgrounds,        // Array of background objects { name, src, id }
    selectedBackground, // The currently selected background object (can be null)
    onSelect            // Function to call when a background is clicked
}) {
    return (
        <section className="background-selection-section">
            <h3>Choose a Background</h3>

            {/* Grid Layout for Background Options */}
            <div className="background-grid">
                {backgrounds.map((bg) => (
                    <div
                        key={bg.name}
                        // Add 'selected' class if this background matches the currently selected one
                        // This allows us to highlight the active choice with CSS
                        className={`background-card ${selectedBackground?.name === bg.name ? "selected" : ""}`}

                        // When clicked, notify the parent component via the onSelect callback
                        onClick={() => onSelect(bg)}
                    >
                        {/* Display the image thumbnail */}
                        <img src={bg.src} alt={bg.name} />

                        {/* Display the name of the background */}
                        <span>{bg.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
