import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBook, FiCalendar, FiUsers, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import "./LibraryPage.css";

// Assets
import pageBg from "../assets/background/goodNews.jpg";

export default function LibraryPage() {
    const [chapters, setChapters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        const username = localStorage.getItem("currentUser") || user?.username;

        if (!username) {
            toast.error("Please log in to view your library");
            navigate("/login");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/library/${username}`);

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

    const handleReadChapter = (chapterId) => {
        // Navigate to story page with chapter ID
        // For now, we'll just show a toast - we'll implement chapter loading next
        toast.success(`Opening chapter: ${chapterId}`);
        // TODO: Implement chapter loading in StoryPage
        navigate(`/story?chapter=${chapterId}`);
    };

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
                    </section>

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
                                            onClick={() => handleReadChapter(chapter.chapter_id)}
                                            className="read-button"
                                        >
                                            Read Story
                                        </button>
                                        {/* Future: Add delete button */}
                                        {/* <button className="delete-button" title="Delete">
                      <FiTrash2 />
                    </button> */}
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
