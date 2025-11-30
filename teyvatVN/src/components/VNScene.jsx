import React from "react";
import VNTextBox from "./VNTextBox";
import { characterDatabase } from "../data/characterData.js";
import "../pages/StoryPage.css"; // Reuse existing styles for now

export default function VNScene({
    story,
    // Alternative to 'story' object for controlled mode:
    characters,
    currentSegment,
    onNext,
    onPrev,
    currentIndex,
    totalSegments,

    backgroundImage,
    isFullscreen,
    onToggleFullscreen,
    onExitFullscreen,
}) {
    // Determine characters list: either from story object or direct prop
    const characterList = story?.characters || characters;

    // Determine segments/segment to show
    // If we have a specific currentSegment (Editor mode), use that.
    // Otherwise use story.segments (Play mode).

    if (!characterList && !story) return null;

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
                {characterList &&
                    characterList.map((charName, index) => {
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
                <VNTextBox
                    segments={story?.segments}
                    segment={currentSegment}
                    onNext={onNext}
                    onPrev={onPrev}
                    currentIndex={currentIndex}
                    totalSegments={totalSegments}
                    embedded={!!currentSegment} // If we are passing a single segment, we are likely in embedded/editor mode
                />
            </section>
        </div>
    );
}
