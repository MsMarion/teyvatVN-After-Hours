import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
    return (
        <header className="story-page-header">
            <div className="logo">teyvat.vn</div>
            <nav className="story-nav-links">
                <Link to="/landing">Home</Link>
                <Link to="/characters">Characters</Link>
                <Link to="/story">Story</Link>
            </nav>
        </header>
    );
}
