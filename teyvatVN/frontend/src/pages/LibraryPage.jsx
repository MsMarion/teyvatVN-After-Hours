import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBook, FiCalendar, FiUsers, FiTrash2, FiEdit2, FiSettings } from "react-icons/fi";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import "../styles/LibraryPage.css";
import { API_BASE_URL } from "../config/api";

// Assets
import pageBg from "../assets/background/goodNews.jpg";

/**
 * Library Page Component
 * 
 * Displays a list of the user's generated stories (chapters).
 * Allows users to read, edit, rename, or delete chapters.
 */
export default function LibraryPage() {
    // --- State Management ---
    // 'chapters' stores the list of story objects fetched from the database.
    const [chapters, setChapters] = useState([]);

    // 'isLoading' indicates if we are currently fetching data from the server.
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const { user } = useAuth();

    // --- Side Effects ---
    // Fetch the user's library when the component first loads.
    useEffect(() => {
        fetchLibrary();
    }, []);

    // --- Data Fetching ---
    /**
     * Retrieves all chapters associated with the current user.
     */
    const fetchLibrary = async () => {
        const username = localStorage.getItem("currentUser") || user?.username;

        if (!username) {
            toast.error("Please log in to view your library");
            navigate("/login");
            return;
        }

        setIsLoading(true);
        try {
            // Make a GET request to the library endpoint
            const response = await fetch(`${API_BASE_URL}/api/library/${username}`);

            if (!response.ok) {
                throw new Error("Failed to fetch library");
            }

            const result = await response.json();
            console.log("Library data:", result);

            if (result.status === "success") {
                setChapters(result.chapters);
            }
        } catch (error) {
            console.error("Error fetching library:", error);
            toast.error("Failed to load library");
        } finally {
            setIsLoading(false);
        }
    };

    // --- User Actions ---

    /**
     * Navigates to the StoryPage to read a specific chapter.
     */
    const handleReadChapter = (chapterId) => {
        // Navigate to story page with chapter ID
        // For now, we'll just show a toast - we'll implement chapter loading next
        toast.success(`Opening chapter: ${chapterId}`);
        // TODO: Implement chapter loading in StoryPage
        navigate(`/story?chapter=${chapterId}`);
    };

    /**
     * Formats a raw date string into a readable format (e.g., "Oct 15, 2023, 10:30 AM").
     */
    const formatDate = (isoString) => {
        if (!isoString) return "Unknown date";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    /**
     * Deletes a chapter after user confirmation.
     */
    const handleDeleteChapter = async (chapterId, chapterTitle) => {
        const username = localStorage.getItem("currentUser") || user?.username;

        // Ask for confirmation before deleting
        if (!confirm(`Are you sure you want to delete "${chapterTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            // Make a DELETE request to the API
            const response = await fetch(`${API_BASE_URL}/api/chapter/${username}/${chapterId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Failed to delete chapter");
            }

            toast.success("Chapter deleted successfully!");
            fetchLibrary(); // Refresh the list to remove the deleted chapter
        } catch (error) {
            console.error("Error deleting chapter:", error);
            toast.error("Failed to delete chapter");
        }
    };

    /**
     * Renames a chapter.
     */
    const handleRenameChapter = async (chapterId, currentTitle) => {
        const username = localStorage.getItem("currentUser") || user?.username;

        // Prompt the user for a new title
        const newTitle = prompt("Enter new title:", currentTitle);

        if (!newTitle || newTitle === currentTitle) {
            return; // User cancelled or didn't change the title
        }

        try {
            // Make a PUT request to update the title
            const response = await fetch(`${API_BASE_URL}/api/chapter/${username}/${chapterId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle })
            });

            if (!response.ok) {
                throw new Error("Failed to rename chapter");
            }

            toast.success("Chapter renamed successfully!");
            fetchLibrary(); // Refresh the list to show the new title
        } catch (error) {
            console.error("Error renaming chapter:", error);
            toast.error("Failed to rename chapter");
        }
    };

    return (
        <Layout backgroundImage={pageBg} className="library-page-container">
            <div className="library-content-container">
                <main className="library-content-wrapper">
                    <section className="library-title-section">
                        <h1>
                            <FiBook className="title-icon" />
                            My Library
                        </h1>
                        <p>
                            Your collection of generated stories. Revisit your favorite moments
                            or continue where you left off.
                        </p>
                        <button
                            onClick={() => navigate("/settings")}
                            className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FiSettings /> API Settings
                        </button>
                    </section>

                    {/* Conditional Rendering: Loading -> Empty -> List */}
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading your library...</p>
                        </div>
                    ) : chapters.length === 0 ? (
                        <div className="empty-state">
                            <FiBook className="empty-icon" />
                            <h2>Your library is empty</h2>
                            <p>Generate your first story to get started!</p>
                            <button
                                onClick={() => navigate("/characters")}
                                className="cta-button"
                            >
                                Create New Story
                            </button>
                        </div>
                    ) : (
                        <section className="chapters-grid">
                            {chapters.map((chapter) => (
                                <div key={chapter.chapter_id} className="chapter-card">
                                    <div className="chapter-card-header">
                                        <h3>{chapter.title}</h3>
                                        <span className="chapter-id">{chapter.chapter_id}</span>
                                    </div>

                                    <div className="chapter-card-body">
                                        {chapter.characters && chapter.characters.length > 0 && (
                                            <div className="chapter-meta">
                                                <FiUsers className="meta-icon" />
                                                <span>{chapter.characters.join(", ")}</span>
                                            </div>
                                        )}

                                        {chapter.created_at && (
                                            <div className="chapter-meta">
                                                <FiCalendar className="meta-icon" />
                                                <span>{formatDate(chapter.created_at)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="chapter-card-footer">
                                        <button
                                            onClick={() => navigate(`/editing?chapter=${chapter.chapter_id}`)}
                                            className="edit-button"
                                        >
                                            <FiEdit2 /> Edit Story
                                        </button>
                                        <button
                                            onClick={() => handleReadChapter(chapter.chapter_id)}
                                            className="read-button"
                                        >
                                            Read Story
                                        </button>
                                        <div className="chapter-actions">
                                            <button
                                                onClick={() => handleRenameChapter(chapter.chapter_id, chapter.title)}
                                                className="action-button rename-button"
                                                title="Rename chapter"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteChapter(chapter.chapter_id, chapter.title)}
                                                className="action-button delete-button"
                                                title="Delete chapter"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}
                </main>
            </div>
        </Layout>
    );
}
