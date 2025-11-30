import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiSave, FiPlay, FiPlus, FiTrash2, FiMove } from "react-icons/fi";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import "../styles/EditorPage.css";

// Assets
import pageBg from "../assets/background/goodNews.jpg";
import bg1 from "../assets/background/favonius-cathedral.jpg";
import bg2 from "../assets/background/mondstadt-night.webp";
import bg3 from "../assets/background/statue-of-seven-day.png";

// Components
import VNScene from "../components/vn/VNScene";
import { characterDatabase } from "../data/characterData.js";
import { API_BASE_URL } from "../config/api";

// Map background IDs to imported images
const backgroundImages = {
    "favonius_cathedral": bg1,
    "mondstadt_night": bg2,
    "statue_of_seven": bg3,
    "angels_share": pageBg
};

export default function EditorPage() {
    const [searchParams] = useSearchParams();
    const [chapter, setChapter] = useState(null);
    const [segments, setSegments] = useState([]);
    const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const chapterId = searchParams.get("chapter");
    const username = localStorage.getItem("currentUser") || user?.username;

    useEffect(() => {
        if (!chapterId) {
            toast.error("No chapter specified");
            navigate("/library");
            return;
        }
        loadChapter();
    }, [chapterId]);

    const loadChapter = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/chapter/${username}/${chapterId}`);

            if (!response.ok) {
                throw new Error("Failed to load chapter");
            }

            const result = await response.json();

            if (result.message === "Loaded" && result.data) {
                setChapter(result.data);
                setSegments(result.data.segments || []);
            } else {
                toast.error("Chapter not found");
                navigate("/library");
            }
        } catch (error) {
            console.error("Error loading chapter:", error);
            toast.error("Failed to load chapter");
            navigate("/library");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedChapter = {
                ...chapter,
                segments: segments
            };

            const response = await fetch(`${API_BASE_URL}/api/chapter/${username}/${chapterId}/segments`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ segments: segments })
            });

            if (!response.ok) {
                throw new Error("Failed to save changes");
            }

            toast.success("Changes saved successfully!");
            setChapter(updatedChapter);
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSegmentChange = (index, field, value) => {
        const newSegments = [...segments];
        newSegments[index] = {
            ...newSegments[index],
            [field]: value
        };
        setSegments(newSegments);
    };

    const handleAddSegment = (index) => {
        const newSegment = {
            type: "narration",
            text: "New narration segment..."
        };
        const newSegments = [...segments];
        newSegments.splice(index + 1, 0, newSegment);
        setSegments(newSegments);
        setSelectedSegmentIndex(index + 1);
    };

    const handleDeleteSegment = (index) => {
        if (!confirm("Are you sure you want to delete this segment?")) {
            return;
        }
        const newSegments = segments.filter((_, i) => i !== index);
        setSegments(newSegments);
        if (selectedSegmentIndex === index) {
            setSelectedSegmentIndex(null);
        }
    };

    const handleMoveSegment = (index, direction) => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === segments.length - 1) return;

        const newSegments = [...segments];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newSegments[index], newSegments[targetIndex]] = [newSegments[targetIndex], newSegments[index]];
        setSegments(newSegments);
        setSelectedSegmentIndex(targetIndex);
    };

    const handlePlayFromHere = (index) => {
        // Navigate to story page with chapter and starting segment
        navigate(`/story?chapter=${chapterId}&start=${index}`);
    };

    const toggleSegmentType = (index) => {
        const segment = segments[index];
        const newSegments = [...segments];

        if (segment.type === "dialogue") {
            newSegments[index] = {
                type: "narration",
                text: segment.line || ""
            };
        } else {
            newSegments[index] = {
                type: "dialogue",
                speaker: chapter?.characters?.[0] || "Unknown",
                line: segment.text || "",
                expression_action: ""
            };
        }
        setSegments(newSegments);
    };

    if (isLoading) {
        return (
            <Layout backgroundImage={pageBg}>
                <div className="editor-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading editor...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout backgroundImage={pageBg} className="editor-page-container">
            <div className="editor-content">
                {/* Header */}
                <div className="editor-header">
                    <div className="editor-title-section">
                        <h1>{chapter?.title || "Untitled Chapter"}</h1>
                        <span className="chapter-id-badge">{chapterId}</span>
                    </div>
                    <div className="editor-actions">
                        <button onClick={handleSave} className="save-btn" disabled={isSaving}>
                            <FiSave /> {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                        <button onClick={() => navigate("/library")} className="back-btn">
                            Back to Library
                        </button>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="editor-main">
                    {/* Segment List */}
                    <div className="segment-list">
                        <div className="segment-list-header">
                            <h2>Segments ({segments.length})</h2>
                        </div>
                        <div className="segment-list-content">
                            {segments.map((segment, index) => (
                                <div
                                    key={index}
                                    className={`segment-item ${selectedSegmentIndex === index ? "selected" : ""}`}
                                    onClick={() => setSelectedSegmentIndex(index)}
                                >
                                    <div className="segment-item-header">
                                        <span className="segment-number">#{index + 1}</span>
                                        <span className={`segment-type-badge ${segment.type}`}>
                                            {segment.type}
                                        </span>
                                    </div>
                                    <div className="segment-preview">
                                        {segment.type === "dialogue" ? (
                                            <>
                                                <strong>{segment.speaker}:</strong> {segment.line?.substring(0, 50)}
                                                {segment.line?.length > 50 ? "..." : ""}
                                            </>
                                        ) : (
                                            <>
                                                {segment.text?.substring(0, 50)}
                                                {segment.text?.length > 50 ? "..." : ""}
                                            </>
                                        )}
                                    </div>
                                    <div className="segment-item-actions">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMoveSegment(index, "up"); }}
                                            disabled={index === 0}
                                            title="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMoveSegment(index, "down"); }}
                                            disabled={index === segments.length - 1}
                                            title="Move down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePlayFromHere(index); }}
                                            title="Play from here"
                                        >
                                            <FiPlay />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editor Panel with Embedded Preview */}
                    <div className="editor-panel">
                        {selectedSegmentIndex !== null ? (
                            <>
                                <div className="editor-panel-header">
                                    <h3>Editing Segment #{selectedSegmentIndex + 1}</h3>
                                    <div className="segment-controls">
                                        <button
                                            onClick={() => toggleSegmentType(selectedSegmentIndex)}
                                            className="toggle-type-btn"
                                        >
                                            Switch to {segments[selectedSegmentIndex].type === "dialogue" ? "Narration" : "Dialogue"}
                                        </button>
                                        <button
                                            onClick={() => handleAddSegment(selectedSegmentIndex)}
                                            className="add-segment-btn"
                                        >
                                            <FiPlus /> Add After
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSegment(selectedSegmentIndex)}
                                            className="delete-segment-btn"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>

                                {/* VN Preview Section */}
                                <div className="vn-preview-section">
                                    <div className="vn-preview-label">
                                        <span>Live Preview</span>
                                    </div>
                                    <div className="vn-preview-stage-compact">
                                        <VNScene
                                            characters={chapter?.characters}
                                            currentSegment={segments[selectedSegmentIndex]}
                                            currentIndex={selectedSegmentIndex}
                                            totalSegments={segments.length}
                                            onNext={() => {
                                                if (selectedSegmentIndex < segments.length - 1) {
                                                    setSelectedSegmentIndex(selectedSegmentIndex + 1);
                                                }
                                            }}
                                            onPrev={() => {
                                                if (selectedSegmentIndex > 0) {
                                                    setSelectedSegmentIndex(selectedSegmentIndex - 1);
                                                }
                                            }}
                                            backgroundImage={backgroundImages[chapter?.backgrounds?.[0]] || pageBg}
                                            isFullscreen={false}
                                        />
                                    </div>
                                </div>

                                {/* Editor Form */}
                                <div className="editor-panel-content">
                                    {segments[selectedSegmentIndex].type === "dialogue" ? (
                                        <>
                                            <div className="form-group">
                                                <label>Speaker</label>
                                                <select
                                                    value={segments[selectedSegmentIndex].speaker || ""}
                                                    onChange={(e) => handleSegmentChange(selectedSegmentIndex, "speaker", e.target.value)}
                                                >
                                                    {chapter?.characters?.map(char => (
                                                        <option key={char} value={char}>{char}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Expression/Action (optional)</label>
                                                <input
                                                    type="text"
                                                    value={segments[selectedSegmentIndex].expression_action || ""}
                                                    onChange={(e) => handleSegmentChange(selectedSegmentIndex, "expression_action", e.target.value)}
                                                    placeholder="e.g., (smiling), (nervously)"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Dialogue</label>
                                                <textarea
                                                    value={segments[selectedSegmentIndex].line || ""}
                                                    onChange={(e) => handleSegmentChange(selectedSegmentIndex, "line", e.target.value)}
                                                    rows={6}
                                                    placeholder="What does the character say?"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="form-group">
                                            <label>Narration</label>
                                            <textarea
                                                value={segments[selectedSegmentIndex].text || ""}
                                                onChange={(e) => handleSegmentChange(selectedSegmentIndex, "text", e.target.value)}
                                                rows={8}
                                                placeholder="Describe what's happening..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="editor-panel-empty">
                                <p>Select a segment from the list to edit</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
