import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Header.css";

/**
 * Header Component
 * 
 * Displays the application logo and navigation links.
 * Shows different links based on authentication status (Login vs Logout).
 */
export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="story-page-header">
            <div className="logo">teyvat.vn</div>
            <nav className="story-nav-links">
                <Link to="/landing">Home</Link>
                <Link to="/characters">Characters</Link>
                <Link to="/story">Story</Link>
                <Link to="/library">Library</Link>
                {user ? (
                    <button onClick={handleLogout} className="nav-link-btn">
                        Logout ({user})
                    </button>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </nav>
        </header>
    );
}
