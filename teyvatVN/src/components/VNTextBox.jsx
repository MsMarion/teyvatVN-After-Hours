import React, { useState } from "react";
import "./VNTextBox.css"; // We'll create this or just rely on global styles for now, but better to separate.

export default function VNTextBox({ segments }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!segments || segments.length === 0) return null;

    const current = segments[currentIndex];
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < segments.length - 1;

    const handlePrev = () => {
        if (hasPrev) setCurrentIndex(currentIndex - 1);
    };

    const handleNext = () => {
        if (hasNext) setCurrentIndex(currentIndex + 1);
    };

    return (
        <div className="vn-textbox-overlay">
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
                    <span className="vn-progress">{currentIndex + 1} / {segments.length}</span>
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
