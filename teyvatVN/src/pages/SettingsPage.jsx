import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiArrowLeft, FiKey } from "react-icons/fi";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import pageBg from "../assets/background/goodNews.jpg"; // Reusing background
import "./SettingsPage.css";

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const username = localStorage.getItem("currentUser") || user?.username;
        if (!username) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/settings/${username}`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === "success" && data.gemini_api_key) {
                    setApiKey(data.gemini_api_key);
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const username = localStorage.getItem("currentUser") || user?.username;

        if (!username) return;

        setIsSaving(true);
        try {
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
            setIsSaving(false);
        }
    };

    return (
        <Layout backgroundImage={pageBg} className="settings-page-container">
            <div className="settings-card">
                <div className="settings-header">
                    <button
                        onClick={() => navigate(-1)}
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
