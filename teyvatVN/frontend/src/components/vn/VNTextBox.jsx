import React, { useState } from "react";
import "../../styles/VNTextBox.css"; // We'll create this or just rely on global styles for now, but better to separate.

/**
 * VNTextBox Component
 * 
 * This component is responsible for displaying the text of the story (dialogue or narration).
 * It mimics the text box found in traditional Visual Novel games.
 * 
 * It operates in two distinct modes:
 * 
 * 1. **Controlled Mode (Editor)**:
 *    - The parent component (like EditorPage) controls which segment is shown.
 *    - It receives a single `segment` prop.
 *    - Navigation buttons call functions passed down from the parent (`onNext`, `onPrev`).
 * 
 * 2. **Uncontrolled Mode (Story Reader)**:
 *    - The component manages its own state.
 *    - It receives a list of all `segments` and handles navigation internally using `localIndex`.
 */
export default function VNTextBox({
    // --- Props ---
    segments,           // Array of all story segments (for Uncontrolled Mode)
    segment,            // Single segment object to display (for Controlled Mode)
    embedded = false,   // Boolean: is this embedded in another view (like the Editor)?

    // Navigation Callbacks (for Controlled Mode)
    onNext,             // Function to go to the next segment
    onPrev,             // Function to go to the previous segment

    // Progress Indicators (for Controlled Mode)
    currentIndex,       // Current segment number
    totalSegments       // Total number of segments
}) {
    // State for Uncontrolled Mode: keeps track of which segment we are reading
    const [localIndex, setLocalIndex] = useState(0);

    // --- Mode 1: Controlled Mode (Editor) ---
    // If a specific 'segment' prop is provided, we render in Controlled Mode.
    if (segment) {
        return (
            <div className={`vn-textbox-overlay ${embedded ? "embedded" : ""}`}>
                <div className="vn-textbox">
                    {/* Conditional Rendering: Dialogue vs. Narration */}
                    {segment.type === "dialogue" ? (
                        // Dialogue: Show speaker name and their spoken line
                        <>
                            <div className="vn-speaker">
                                {segment.speaker}
                                {/* Show expression/action if available (e.g., "smiles") */}
                                <span className="vn-expression">{segment.expression_action}</span>
                            </div>
                            <div className="vn-dialogue">{segment.line}</div>
                        </>
                    ) : (
                        // Narration: Just show the descriptive text
                        <div className="vn-narration">{segment.text}</div>
                    )}

                    {/* Navigation Controls */}
                    {(onNext || onPrev) && (
                        <div className="vn-navigation">
                            <button
                                onClick={onPrev}
                                disabled={!onPrev || currentIndex === 0}
                                className="vn-nav-btn"
                            >
                                ← Prev
                            </button>

                            {/* Progress Counter (e.g., "1 / 10") */}
                            <span className="vn-progress">
                                {typeof currentIndex === 'number' && totalSegments
                                    ? `${currentIndex + 1} / ${totalSegments}`
                                    : ""}
                            </span>

                            <button
                                onClick={onNext}
                                disabled={!onNext || (totalSegments && currentIndex >= totalSegments - 1)}
                                className="vn-nav-btn"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Mode 2: Uncontrolled Mode (Story Reader) ---
    // If no single 'segment' is provided, we expect a list of 'segments'.
    if (!segments || segments.length === 0) return null;

    // Get the current segment based on our internal state
    const current = segments[localIndex];

    // Helper booleans to disable buttons if we are at the start or end
    const hasPrev = localIndex > 0;
    const hasNext = localIndex < segments.length - 1;

    // Internal navigation handlers
    const handlePrev = () => {
        if (hasPrev) setLocalIndex(localIndex - 1);
    };

    const handleNext = () => {
        if (hasNext) setLocalIndex(localIndex + 1);
    };

    return (
        <div className={`vn-textbox-overlay ${embedded ? "embedded" : ""}`}>
            <div className="vn-textbox">
                {/* Conditional Rendering: Dialogue vs. Narration */}
                {current.type === "dialogue" ? (
                    <>
                        <div className="vn-speaker">
                            {current.speaker} <span className="vn-expression">{current.expression_action}</span>
                        </div>
                        <div className="vn-dialogue">{current.line}</div>
                    </>
                ) : (
                    <div className="vn-narration">{current.text}</div>
                )}

                {/* Internal Navigation Controls */}
                <div className="vn-navigation">
                    <button
                        onClick={handlePrev}
                        disabled={!hasPrev}
                        className="vn-nav-btn"
                    >
                        ← Prev
                    </button>
                    <span className="vn-progress">{localIndex + 1} / {segments.length}</span>
                    <button
                        onClick={handleNext}
                        disabled={!hasNext}
                        className="vn-nav-btn"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}
