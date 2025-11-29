import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

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
