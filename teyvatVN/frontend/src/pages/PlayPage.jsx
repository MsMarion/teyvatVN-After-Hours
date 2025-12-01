import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/StoryPage.css"; // Reusing StoryPage styles

// Components
import VNScene from "../components/vn/VNScene";
import Layout from "../components/layout/Layout";

// Config & Context
import { BACKGROUND_OPTIONS } from "../config/backgrounds.js";
import { API_BASE_URL } from "../config/api";

// Assets
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
 * Play Page Component
 * 
 * This page is dedicated to "Playing" (reading) a story.
 * It is different from StoryPage because it doesn't have the generation tools.
 * It just loads an existing story (from the URL or local storage) and shows it.
 */
export default function PlayPage() {
    // --- State Management ---
    const [selectedBackground, setSelectedBackground] = useState(null);
    const [generatedStory, setGeneratedStory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 'useSearchParams' lets us read data from the URL (like ?chapter=123)
    const [searchParams] = useSearchParams();

    // Build backgrounds array from configuration with proper image mapping
    const backgrounds = BACKGROUND_OPTIONS.map(bg => ({
        id: bg.id,
        name: bg.displayName,
        src: backgroundImages[bg.id]
    }));

    // --- Side Effects ---
    // When the page loads (or URL changes), check if we need to load a specific chapter
    useEffect(() => {
        const chapterId = searchParams.get("chapter");

        if (chapterId) {
            // If URL has ?chapter=123, load that chapter from the server
            loadChapter(chapterId);
        } else {
            // Otherwise, try to load the last generated story from local storage (for quick testing)
            const latest = localStorage.getItem("latestResult");
            if (latest) {
                try {
                    const data = JSON.parse(latest);
                    setGeneratedStory(data);

                    // If the story has a background setting, apply it
                    if (data.backgrounds && data.backgrounds.length > 0) {
                        const bgId = data.backgrounds[0];
                        const matchedBg = backgrounds.find(bg => bg.id === bgId);
                        if (matchedBg) setSelectedBackground(matchedBg);
                    }
                } catch (e) {
                    console.error("Failed to parse latest result", e);
                }
            }
        }
    }, [searchParams]);

    /**
     * Fetches a specific chapter from the backend API.
     */
    const loadChapter = async (chapterId) => {
        const username = localStorage.getItem("currentUser") || "dawn";
        setIsLoading(true);

        try {
            console.log(`Loading chapter: ${chapterId} for user: ${username}`);
            const response = await fetch(`${API_BASE_URL}/api/chapter/${username}/${chapterId}`);

            if (!response.ok) {
                throw new Error("Failed to load chapter");
            }

            const result = await response.json();
            console.log("Chapter loaded:", result);

            if (result.message === "Loaded" && result.data) {
                setGeneratedStory(result.data);

                // Auto-select background based on chapter data
                if (result.data.backgrounds && result.data.backgrounds.length > 0) {
                    const bgId = result.data.backgrounds[0];
                    const matchedBg = backgrounds.find(bg => bg.id === bgId);
                    if (matchedBg) {
                        setSelectedBackground(matchedBg);
                    }
                }
            } else {
                toast.error("Chapter not found");
            }
        } catch (error) {
            console.error("Error loading chapter:", error);
            toast.error(`Failed to load chapter: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout backgroundImage={pageBg} className="story-page-container">
            <div className="story-content-container">
                <main className="story-content-wrapper" style={{ maxWidth: '100%', padding: '2rem' }}>
                    {isLoading && (
                        <div className="loading-indicator">Loading story...</div>
                    )}

                    {!generatedStory && !isLoading && (
                        <div className="text-center p-10">
                            <h2>No story loaded</h2>
                            <p>Provide a ?chapter=ID parameter to play a story.</p>
                        </div>
                    )}

                    {/* 
                      VNScene is the core component that renders the Visual Novel.
                      We pass it the story data and background, and it handles the rest.
                    */}
                    <VNScene
                        story={generatedStory}
                        backgroundImage={selectedBackground?.src}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={() => setIsFullscreen(true)}
                        onExitFullscreen={() => setIsFullscreen(false)}
                    />
                </main>
            </div>
        </Layout>
    );
}
