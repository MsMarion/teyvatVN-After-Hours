import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiRefreshCcw } from "react-icons/fi";
import "./StoryPage.css";

// Assuming you have this context and data file set up
import { useCharacters } from "../context/CharacterContext";
import { characterDatabase } from "../data/characterData.js";
import SegmentNavigator from "../components/SegmentNavigator";
import { BACKGROUND_OPTIONS, getBackgroundById, getBackgroundByName } from "../config/backgrounds.js";

// Import your assets
import quillIcon from "../assets/images/quill.png";
import pageBg from "../assets/background/goodNews.jpg";
import bg1 from "../assets/background/favonius-cathedral.jpg";
import bg2 from "../assets/background/mondstadt-night.webp";
import bg3 from "../assets/background/statue-of-seven-day.png";

// Map background IDs to imported images
const backgroundImages = {
  "favonius_cathedral": bg1,
  "mondstadt_night": bg2,
  "statue_of_seven": bg3,
  "angels_share": pageBg
};

// Visual Novel Text Box Component
function VNTextBox({ segments }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

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

export default function StoryPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { selectedCharacters } = useCharacters();

  // Redirect if no characters are selected (check localStorage first for persistence)
  useEffect(() => {
    // Check if characters are in localStorage (persisted selection)
    const char1 = localStorage.getItem("character1");
    const char2 = localStorage.getItem("character2");
    const hasPersistedCharacters = char1 && char2;

    // Only redirect if no characters in context AND no persisted characters
    if ((!selectedCharacters || selectedCharacters.length < 2) && !hasPersistedCharacters) {
      alert("Please select your characters first!");
      navigate("/characters");
    }
  }, [selectedCharacters, navigate]);

  // Build backgrounds array from configuration with proper image mapping
  const backgrounds = BACKGROUND_OPTIONS.map(bg => ({
    id: bg.id,
    name: bg.displayName,
    src: backgroundImages[bg.id]
  }));

  const handleGenerate = async () => {
    const username = localStorage.getItem("currentUser") || "dawn";

    if (!prompt) {
      alert("Please enter a prompt!");
      return;
    }

    setIsLoading(true);
    setGeneratedStory(null); // Clear previous story

    try {
      console.log("Generating story...");

      // Get selected characters from localStorage
      const char1 = localStorage.getItem("character1");
      const char2 = localStorage.getItem("character2");

      // Build enhanced prompt with character context
      const characterContext = char1 && char2
        ? `Characters: ${char1} and ${char2}. `
        : "";
      const enhancedPrompt = characterContext + prompt;

      const response = await fetch("http://localhost:4000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          username: username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Generation failed");
      }

      const result = await response.json();
      console.log("Story generated:", result);

      if (result.status === "success" && result.data) {
        // Store the complete chapter data
        setGeneratedStory(result.data);

        // Auto-select background based on AI's choice (using ID-based matching)
        if (result.data.backgrounds && result.data.backgrounds.length > 0) {
          const bgId = result.data.backgrounds[0]; // AI returns background ID like "favonius_cathedral"
          const matchedBg = backgrounds.find(bg => bg.id === bgId);
          if (matchedBg) {
            setSelectedBackground(matchedBg);
            console.log(`Auto-selected background: ${bgId} (${matchedBg.name})`);
          } else {
            console.warn(`Background ID "${bgId}" not found in available backgrounds`);
          }
        }

        // Also save to localStorage
        localStorage.setItem("latestResult", JSON.stringify(result.data));
        localStorage.setItem("latestPrompt", prompt);
      } else {
        alert("Failed to generate story structure.");
      }

    } catch (error) {
      console.error("Error generating story:", error);
      alert(`Failed to generate story: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    navigate("/characters");
  };

  const handleSave = () => {
    if (!generatedStory) {
      alert("There's no story to save!");
      return;
    }
    console.log("Story Saved!", generatedStory);
  };

  return (
    <div
      className="story-page-container"
      style={{ backgroundImage: `url(${pageBg})` }}
    >
      <header className="story-page-header">
        <div className="logo">teyvat.vn</div>
        <nav className="story-nav-links">
          <Link to="/landing">Home</Link>
          <Link to="/characters">Characters</Link>
          <Link to="/story">Story</Link>
        </nav>
      </header>

      <div className="story-content-container">
        <main className="story-content-wrapper">
          <section className="story-title-section">
            <h1>Story</h1>
            <p>
              Here's where the magic happens. Drop your duo anywhere you want.
              Mondstadt? College? Outer space? It's your story — you decide!
            </p>
          </section>

          <section className="background-selection-section">
            <h3>Choose a Background</h3>
            <div className="background-grid">
              {backgrounds.map((bg) => (
                <div
                  key={bg.name}
                  className={`background-card ${selectedBackground?.name === bg.name ? "selected" : ""
                    }`}
                  onClick={() => setSelectedBackground(bg)}
                >
                  <img src={bg.src} alt={bg.name} />
                  <span>{bg.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section
            className="visual-novel-ui"
            style={{
              backgroundImage: selectedBackground
                ? `url(${selectedBackground.src})`
                : "none",
            }}
          >
            {!selectedBackground && <span>Visual novel UI</span>}

            {/* This now dynamically displays the correct story sprite */}
            {selectedBackground &&
              selectedCharacters &&
              selectedCharacters.map((char, index) => {
                // Look up the character in our database to get the correct story sprite
                const charData = characterDatabase[char.name];
                const storySprite = charData
                  ? Object.values(charData.storySprites)[0]
                  : char.image; // Fallback to card image

                return (
                  <img
                    key={char.name}
                    src={storySprite}
                    alt={char.name}
                    className={`character-sprite pos-${index + 1}`}
                  />
                );
              })}

            {/* Visual Novel Text Box Overlay */}
            {generatedStory && (
              <VNTextBox segments={generatedStory.segments} />
            )}
          </section>

          {/* Expression switcher has been removed */}

          <section className="story-prompt-section">
            <h3>Write your Prompt</h3>
            <div className="prompt-input-wrapper">
              <input
                type="text"
                placeholder="e.g., A sudden rainstorm during a heated argument..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="prompt-input"
              />
              <button
                onClick={handleGenerate}
                className="prompt-submit-button"
                disabled={isLoading}
              >
                <FiArrowRight />
              </button>
            </div>
          </section>

          {isLoading && (
            <div className="loading-indicator">Generating your story...</div>
          )}

          {generatedStory && (
            <section className="generated-story-section">
              <h3>Generated Story: {generatedStory.title}</h3>
              <p className="setting-narration">{generatedStory.setting_narration}</p>
              <div className="story-display">
                <SegmentNavigator segments={generatedStory.segments} />
              </div>
            </section>
          )}

          {/* Action buttons are back */}
          <section className="action-buttons">
            <button
              onClick={handleSave}
              className="action-button save"
              disabled={!generatedStory || isLoading}
            >
              Save Story
            </button>
          </section>

          <section className="reset-section">
            <h2>Want a fresh start?</h2>
            <button onClick={handleReset} className="reset-button">
              <span>Reset</span>
              <FiRefreshCcw />
            </button>
          </section>
        </main>
      </div>

      <footer className="story-footer">
        <div className="story-footer-content">
          <div className="footer-text">
            <p>
              Built for <strong>GemiKnights</strong> 2025. Powered by Google
              Gemini.
            </p>
            <p>
              Quill pen SVG by Kangrif from{" "}
              <a
                href="https://thenounproject.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Noun Project
              </a>{" "}
              (CC BY 3.0).
            </p>
          </div>
          <img src={quillIcon} alt="Quill Icon" className="footer-quill" />
        </div>
      </footer>
    </div>
  );
}
