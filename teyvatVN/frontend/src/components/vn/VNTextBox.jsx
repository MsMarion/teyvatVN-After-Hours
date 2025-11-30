import React, { useState } from "react";
import "../../styles/VNTextBox.css"; // We'll create this or just rely on global styles for now, but better to separate.

/**
 * VNTextBox Component
 * 
 * Displays the dialogue or narration text in a visual novel style box.
 * 
 * Supports two modes:
 * 1. Controlled Mode (Editor): Displays a single `segment` passed as a prop. Navigation is handled externally via callbacks.
 * 2. Uncontrolled Mode (Story Reader): Takes a list of `segments` and manages the current index internally.
 */
export default function VNTextBox({
    segments,
    segment,
    embedded = false,
    onNext,
    onPrev,
    currentIndex,
    totalSegments
}) {
    const [localIndex, setLocalIndex] = useState(0);

    // Controlled mode (Editor)
    if (segment) {
        return (
            <div className={`vn-textbox-overlay ${embedded ? "embedded" : ""}`}>
                <div className="vn-textbox">
                    {segment.type === "dialogue" ? (
                        <>
                            <div className="vn-speaker">
                                {segment.speaker} <span className="vn-expression">{segment.expression_action}</span>
                            </div>
                            <div className="vn-dialogue">{segment.line}</div>
                        </>
                    ) : (
                        <div className="vn-narration">{segment.text}</div>
                    )}

                    {/* Navigation for Controlled Mode */}
                    {(onNext || onPrev) && (
                        <div className="vn-navigation">
                            <button
                                onClick={onPrev}
                                disabled={!onPrev || currentIndex === 0}
                                className="vn-nav-btn"
                            >
                                ← Prev
                            </button>
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

    // Uncontrolled mode (Story Reader)
    if (!segments || segments.length === 0) return null;

    const current = segments[localIndex];
    const hasPrev = localIndex > 0;
    const hasNext = localIndex < segments.length - 1;

    const handlePrev = () => {
        if (hasPrev) setLocalIndex(localIndex - 1);
    };

    const handleNext = () => {
        if (hasNext) setLocalIndex(localIndex + 1);
    };

    return (
        <div className={`vn-textbox-overlay ${embedded ? "embedded" : ""}`}>
            <div className="vn-textbox">
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
