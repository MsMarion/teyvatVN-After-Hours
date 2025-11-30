import React from "react";
import VNTextBox from "./VNTextBox";
import { characterDatabase } from "../data/characterData.js";
import quillIcon from "../assets/images/quill.png";
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
    const hasContent = !!(characterList || story);

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
                {!hasContent ? (
                    <div className="vn-placeholder">
                        <img src={quillIcon} alt="Waiting for story..." className="vn-placeholder-icon" />
                        <p>Your story will appear here...</p>
                    </div>
                ) : (
                    <>
                        {!backgroundImage && <span className="debug-bg-label">Visual novel UI</span>}

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
                    </>
                )}
            </section>
        </div>
    );
}
