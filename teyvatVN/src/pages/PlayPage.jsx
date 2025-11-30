import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import "./StoryPage.css"; // Reusing StoryPage styles

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

export default function PlayPage() {
    const [selectedBackground, setSelectedBackground] = useState(null);
    const [generatedStory, setGeneratedStory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchParams] = useSearchParams();

    // Build backgrounds array from configuration with proper image mapping
    const backgrounds = BACKGROUND_OPTIONS.map(bg => ({
        id: bg.id,
        name: bg.displayName,
        src: backgroundImages[bg.id]
    }));

    // Load chapter from URL parameter
    useEffect(() => {
        const chapterId = searchParams.get("chapter");
        if (chapterId) {
            loadChapter(chapterId);
        } else {
            const latest = localStorage.getItem("latestResult");
            if (latest) {
                try {
                    const data = JSON.parse(latest);
                    setGeneratedStory(data);
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

    // Function to load an existing chapter
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

                    {/* Reusable Visual Novel Scene */}
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
