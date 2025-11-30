import React from "react";
import VNTextBox from "./VNTextBox";
import { characterDatabase } from "../data/characterData.js";
import "../pages/StoryPage.css"; // Reuse existing styles for now

export default function VNScene({
    story,
    backgroundImage,
    isFullscreen,
    onToggleFullscreen,
    onExitFullscreen,
}) {
    if (!story) return null;

    return (
        <div className={`vn-fullscreen-wrapper ${isFullscreen ? 'fullscreen-active' : ''}`}>
            {isFullscreen && (
                <button
                    className="fullscreen-exit-btn"
                    onClick={onExitFullscreen}
                    title="Exit Fullscreen (ESC)"
                >
                    ✕ Exit Fullscreen
                </button>
            )}

            <section
                className={`visual-novel-ui ${isFullscreen ? 'fullscreen' : ''}`}
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                    // If not fullscreen, let the parent control height, or default to existing CSS
                }}
            >
                {!backgroundImage && <span>Visual novel UI</span>}

                {/* Fullscreen toggle button */}
                {!isFullscreen && onToggleFullscreen && (
                    <button
                        className="fullscreen-toggle-btn"
                        onClick={onToggleFullscreen}
                        title="Enter Fullscreen"
                    >
                        ⛶ Fullscreen
                    </button>
                )}

                {/* Character Sprites */}
                {story.characters &&
                    story.characters.map((charName, index) => {
                        const charData = characterDatabase[charName];
                        const storySprite = charData
                            ? Object.values(charData.storySprites)[0]
                            : null;

                        if (!storySprite) return null;

                        return (
                            <img
                                key={charName}
                                src={storySprite}
                                alt={charName}
                                className={`character-sprite pos-${index + 1}`}
                            />
                        );
                    })}

                {/* Visual Novel Text Box Overlay */}
                <VNTextBox segments={story.segments} />
            </section>
        </div>
    );
}
