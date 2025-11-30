import React from "react";

export default function BackgroundSelector({ backgrounds, selectedBackground, onSelect }) {
    return (
        <section className="background-selection-section">
            <h3>Choose a Background</h3>
            <div className="background-grid">
                {backgrounds.map((bg) => (
                    <div
                        key={bg.name}
                        className={`background-card ${selectedBackground?.name === bg.name ? "selected" : ""
                            }`}
                        onClick={() => onSelect(bg)}
                    >
                        <img src={bg.src} alt={bg.name} />
                        <span>{bg.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
