import React from "react";
import { Link } from "react-router-dom";
import quillIcon from "../../assets/images/quill.png";
import "../../styles/Footer.css";

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <div className="footer-logo">teyvat.vn</div>
                    <p className="footer-tagline">
                        Your story. Their world. Any universe.
                    </p>
                    <p className="footer-copyright">
                        © 2025 GemiKnights. Powered by Google Gemini.
                    </p>
                </div>

                <div className="footer-section sitemap-section">
                    <h4>Sitemap</h4>
                    <ul>
                        <li><Link to="/landing">Home</Link></li>
                        <li><Link to="/characters">Characters</Link></li>
                        <li><Link to="/story">Story</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </ul>
                </div>

                <div className="footer-section credits-section">
                    <h4>Credits</h4>
                    <div className="credits-content">
                        <p>
                            Quill pen SVG by Kangrif from{" "}
                            <a
                                href="https://thenounproject.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Noun Project
                            </a>{" "}
                            (CC BY 3.0).
                        </p>
                        <img src={quillIcon} alt="Quill Icon" className="footer-quill" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
