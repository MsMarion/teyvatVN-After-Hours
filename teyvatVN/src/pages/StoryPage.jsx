import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiRefreshCcw } from "react-icons/fi";
import "./StoryPage.css";

// Assuming you have this context and data file set up
import { useCharacters } from "../context/CharacterContext";
import { characterDatabase } from "../data/characterData.js";

// Import your assets
import quillIcon from "../assets/images/quill.png";
import pageBg from "../assets/background/goodNews.jpg";
import bg1 from "../assets/background/favonius-cathedral.jpg";
import bg2 from "../assets/background/mondstadt-night.webp";
import bg3 from "../assets/background/statue-of-seven-day.png";

export default function StoryPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [generatedStory, setGeneratedStory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { selectedCharacters } = useCharacters();

  // Redirect if no characters are selected
  useEffect(() => {
    if (!selectedCharacters || selectedCharacters.length < 2) {
      alert("Please select your characters first!");
      navigate("/characters");
    }
  }, [selectedCharacters, navigate]);

  const backgrounds = [
    { name: "Favonius Cathedral", src: bg1 },
    { name: "Mondstadt Night", src: bg2 },
    { name: "Statue of the Seven", src: bg3 },
  ];

  const handleGenerate = async () => {
    // ... API call logic would go here ...
    const character1 = localStorage.getItem("character1");
    const character2 = localStorage.getItem("character2");
    console.log("Generating story...");
    console.log("Story logging information so that it can do the api calls in the backend")
    console.log("prompt is ", prompt)
    console.log("char1 is ", character1)
    console.log("char2 is ", character2)
    console.log("background is ", selectedBackground)
    
    //send api call with these data as it is. todo later
    await fetch("http://localhost:4000/api/dawn/chapter1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        char1: character1,
        char2: character2,
        background: selectedBackground,
      }),
    });


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
              Here’s where the magic happens. Drop your duo anywhere you want.
              Mondstadt? College? Outer space? It’s your story — you decide!
            </p>
          </section>

          <section className="background-selection-section">
            <h3>Choose a Background</h3>
            <div className="background-grid">
              {backgrounds.map((bg) => (
                <div
                  key={bg.name}
                  className={`background-card ${
                    selectedBackground?.name === bg.name ? "selected" : ""
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
            <pre className="story-output">{generatedStory}</pre>
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
