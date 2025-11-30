import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowRight, FiRefreshCcw } from "react-icons/fi";
import toast from "react-hot-toast";
import "../styles/StoryPage.css";

// Components
import VNScene from "../components/vn/VNScene";
import BackgroundSelector from "../components/vn/BackgroundSelector";
import Layout from "../components/layout/Layout";

// Config & Context
import { useCharacters } from "../context/CharacterContext";
import { characterDatabase } from "../data/characterData.js";
import SegmentNavigator from "../components/vn/SegmentNavigator";
import { BACKGROUND_OPTIONS } from "../config/backgrounds.js";
import { API_URL, API_BASE_URL } from "../config/api";

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

/**
 * Story Page Component
 * 
 * The main interface for generating and reading stories.
 * Allows users to input a prompt, generate a story via AI,
 * and view it in a visual novel format.
 */
export default function StoryPage() {
  // --- State Management ---
  // 'prompt' stores the text the user types into the input box.
  const [prompt, setPrompt] = useState("");

  // 'selectedBackground' stores the currently chosen background object (id, name, src).
  const [selectedBackground, setSelectedBackground] = useState(null);

  // 'generatedStory' holds the full story object returned from the backend API.
  // It is null until a story is successfully generated or loaded.
  const [generatedStory, setGeneratedStory] = useState(null);

  // 'isLoading' is a boolean flag (true/false) to show a loading spinner
  // while waiting for the API to respond.
  const [isLoading, setIsLoading] = useState(false);

  // 'isFullscreen' controls whether the visual novel scene is displayed in full screen.
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Hooks ---
  // 'useSearchParams' allows us to read parameters from the URL (e.g., ?chapter=123).
  const [searchParams] = useSearchParams();

  // 'useNavigate' gives us a function to programmatically change the URL (redirect users).
  const navigate = useNavigate();

  // 'useCharacters' is a custom hook to access the globally selected characters.
  const { selectedCharacters } = useCharacters();

  // Build backgrounds array from configuration with proper image mapping
  const backgrounds = BACKGROUND_OPTIONS.map(bg => ({
    id: bg.id,
    name: bg.displayName,
    src: backgroundImages[bg.id]
  }));

  // --- Side Effects (useEffect) ---

  // Effect 1: Check for 'chapter' in URL
  // This runs once when the component mounts (loads) or when searchParams change.
  // If a chapter ID is found in the URL, we immediately try to load that chapter.
  useEffect(() => {
    const chapterId = searchParams.get("chapter");
    if (chapterId) {
      loadChapter(chapterId);
    }
  }, [searchParams]);

  // Effect 2: Validate Character Selection
  // This ensures users don't land on this page without picking characters first.
  // It checks both the global state (Context) and LocalStorage (browser memory).
  useEffect(() => {
    // Skip character check if we're loading a chapter from URL (viewing mode)
    const chapterId = searchParams.get("chapter");
    if (chapterId) {
      return;
    }

    // Check if characters are in localStorage (persisted selection)
    const char1 = localStorage.getItem("character1");
    const char2 = localStorage.getItem("character2");
    const hasPersistedCharacters = char1 && char2;

    // Only redirect if no characters in context AND no persisted characters
    if ((!selectedCharacters || selectedCharacters.length < 2) && !hasPersistedCharacters) {
      toast.error("Please select your characters first!");
      navigate("/characters");
    }
  }, [selectedCharacters, navigate, searchParams]);

  // --- Helper Functions ---

  /**
   * Fetches an existing chapter from the backend API.
   * @param {string} chapterId - The unique ID of the chapter to load.
   */
  const loadChapter = async (chapterId) => {
    const username = localStorage.getItem("currentUser") || "dawn";
    setIsLoading(true); // Start loading

    try {
      console.log(`Loading chapter: ${chapterId} for user: ${username}`);
      // Make a GET request to the backend
      const response = await fetch(`${API_BASE_URL}/api/chapter/${username}/${chapterId}`);

      if (!response.ok) {
        throw new Error("Failed to load chapter");
      }

      const result = await response.json(); // Parse JSON response
      console.log("Chapter loaded:", result);

      if (result.message === "Loaded" && result.data) {
        setGeneratedStory(result.data); // Update state with story data
        toast.success(`Chapter loaded: ${result.data.title}`);

        // Auto-select background based on chapter data
        if (result.data.backgrounds && result.data.backgrounds.length > 0) {
          const bgId = result.data.backgrounds[0];
          const matchedBg = backgrounds.find(bg => bg.id === bgId);
          if (matchedBg) {
            setSelectedBackground(matchedBg);
            console.log(`Auto-selected background: ${bgId}`);
          }
        }
      } else {
        toast.error("Chapter not found");
      }
    } catch (error) {
      console.error("Error loading chapter:", error);
      toast.error(`Failed to load chapter: ${error.message}`);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  /**
   * Sends the user's prompt and characters to the AI backend to generate a story.
   */
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

      // Make a POST request to the AI generation endpoint
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

        // Also save to localStorage for persistence across reloads
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
    <Layout backgroundImage={pageBg} className="story-page-container">
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

          {/* Reusable Visual Novel Scene */}
          <VNScene
            story={generatedStory}
            backgroundImage={selectedBackground?.src}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(true)}
            onExitFullscreen={() => setIsFullscreen(false)}
          />

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
    </Layout>
  );
}
