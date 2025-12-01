import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiArrowLeft, FiKey } from "react-icons/fi";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import pageBg from "../assets/background/goodNews.jpg"; // Reusing background
import "../styles/SettingsPage.css";

/**
 * Settings Page Component
 * 
 * Allows users to manage their account settings.
 * Currently, the main setting is the "Gemini API Key", which is required
 * for the AI story generation to work.
 */
export default function SettingsPage() {
    // --- State Management ---
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(true); // Loading state for fetching initial data
    const [isSaving, setIsSaving] = useState(false);  // Loading state for saving changes

    // --- Hooks ---
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- Side Effects ---
    // Fetch existing settings when the page loads
    useEffect(() => {
        fetchSettings();
    }, []);

    /**
     * Retrieves the user's current settings from the backend.
     */
    const fetchSettings = async () => {
        // Get username from local storage or context
        const username = localStorage.getItem("currentUser") || user?.username;

        // If not logged in, redirect to login page
        if (!username) {
            navigate("/login");
            return;
        }

        try {
            // Make a GET request to our API
            const response = await fetch(`${API_BASE_URL}/api/user/settings/${username}`);

            if (response.ok) {
                const data = await response.json();
                // If we successfully got data, update our state
                if (data.status === "success" && data.gemini_api_key) {
                    setApiKey(data.gemini_api_key);
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast.error("Failed to load settings");
        } finally {
            // Always turn off loading spinner, success or fail
            setIsLoading(false);
        }
    };

    /**
     * Saves the updated settings to the backend.
     */
    const handleSave = async (e) => {
        e.preventDefault(); // Prevent the form from reloading the page

        const username = localStorage.getItem("currentUser") || user?.username;
        if (!username) return;

        setIsSaving(true); // Show "Saving..." indicator

        try {
            // Make a PUT request to update data
            const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    gemini_api_key: apiKey
                }),
            });

            if (response.ok) {
                toast.success("Settings saved successfully");
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false); // Turn off "Saving..." indicator
        }
    };

    return (
        <Layout backgroundImage={pageBg} className="settings-page-container">
            <div className="settings-card">
                {/* Header with Back Button */}
                <div className="settings-header">
                    <button
                        onClick={() => navigate(-1)} // Go back to previous page
                        className="back-button"
                        title="Go Back"
                    >
                        <FiArrowLeft size={24} />
                    </button>
                    <h1 className="settings-title">
                        <FiKey /> API Settings
                    </h1>
                </div>

                {isLoading ? (
                    <div className="loading-container">Loading settings...</div>
                ) : (
                    <form onSubmit={handleSave} className="settings-form">
                        <div className="form-group">
                            <label className="form-label">
                                Gemini API Key
                            </label>
                            {/* Password input type hides the key characters */}
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your Gemini API Key"
                                className="form-input"
                            />
                            <p className="form-helper">
                                Your API key is stored securely and used only for generating your stories.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="save-button"
                            title="Save Settings"
                        >
                            {isSaving ? "Saving..." : (
                                <>
                                    <FiSave /> Save Settings
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </Layout>
    );
}
