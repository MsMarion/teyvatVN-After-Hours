import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Header.css";

/**
 * Header Component
 * 
 * The top navigation bar of the website.
 * It changes what it shows based on whether the user is logged in or not.
 */
export default function Header() {
    // Get the current user and logout function from our global AuthContext
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Clear the user's session
        navigate("/login"); // Send them back to the login page
    };

    return (
        <header className="story-page-header">
            <div className="logo">teyvat.vn</div>

            <nav className="story-nav-links">
                {/* Navigation Links */}
                <Link to="/landing">Home</Link>
                <Link to="/characters">Characters</Link>
                <Link to="/story">Story</Link>
                <Link to="/library">Library</Link>

                {/* Conditional Rendering:
                    IF user is logged in (user exists), show the Logout button.
                    ELSE (user is null), show the Login link.
                */}
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
