import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiRefreshCcw } from "react-icons/fi";
import toast from "react-hot-toast";
import "./StoryPage.css";

// Components
import VNTextBox from "../components/VNTextBox";
import BackgroundSelector from "../components/BackgroundSelector";

// Config & Context
import { useCharacters } from "../context/CharacterContext";
import { characterDatabase } from "../data/characterData.js";
import SegmentNavigator from "../components/SegmentNavigator";
import { BACKGROUND_OPTIONS } from "../config/backgrounds.js";
import { API_URL } from "../config/api";

// Assets
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

export default function StoryPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      toast.error("Please select your characters first!");
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
      toast.error("Please enter a prompt!");
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

      const response = await fetch(API_URL, {
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
        toast.success("Story generated successfully!");

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
        toast.error("Failed to generate story structure.");
      }

    } catch (error) {
      console.error("Error generating story:", error);
      toast.error(`Failed to generate story: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    navigate("/characters");
  };

  const handleSave = () => {
    if (!generatedStory) {
      toast.error("There's no story to save!");
      return;
    }
    console.log("Story Saved!", generatedStory);
    toast.success("Story saved!");
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

          {/* Prompt Input Section - Moved to top */}
          <section className="story-prompt-section">
            <h3>Write your Prompt</h3>
            <div className="prompt-input-wrapper">
              <input
                type="text"
                placeholder="e.g., A sudden rainstorm during a heated argument..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="prompt-input"
                disabled={isLoading}
              />
              <button
                onClick={handleGenerate}
                className="prompt-submit-button"
                disabled={isLoading}
              >
                <FiArrowRight />
              </button>
            </div>
            {isLoading && (
              <div className="loading-indicator">Generating your story...</div>
            )}
          </section>

          {/* Fullscreen Visual Novel Viewer */}
          <div className={`vn-fullscreen-wrapper ${isFullscreen ? 'fullscreen-active' : ''}`}>
            {isFullscreen && (
              <button
                className="fullscreen-exit-btn"
                onClick={() => setIsFullscreen(false)}
                title="Exit Fullscreen (ESC)"
              >
                ✕ Exit Fullscreen
              </button>
            )}

            <section
              className={`visual-novel-ui ${isFullscreen ? 'fullscreen' : ''}`}
              style={{
                backgroundImage: selectedBackground
                  ? `url(${selectedBackground.src})`
                  : "none",
              }}
            >
              {!selectedBackground && <span>Visual novel UI</span>}

              {/* Fullscreen toggle button (only show when story is generated) */}
              {generatedStory && !isFullscreen && (
                <button
                  className="fullscreen-toggle-btn"
                  onClick={() => setIsFullscreen(true)}
                  title="Enter Fullscreen"
                >
                  ⛶ Fullscreen
                </button>
              )}

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
          </div>

          {/* Background Selection - Moved below VN UI */}
          <BackgroundSelector
            backgrounds={backgrounds}
            selectedBackground={selectedBackground}
            onSelect={setSelectedBackground}
          />

          {/* Generated Story Results - Kept below VN UI */}
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
