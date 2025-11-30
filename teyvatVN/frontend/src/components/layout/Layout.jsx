import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "../../styles/Layout.css";

/**
 * Layout Component
 * 
 * A wrapper component that provides a consistent page structure.
 * Includes the Header, main content area, and Footer.
 * Supports an optional background image.
 */
export default function Layout({ children, backgroundImage, className = "" }) {
    return (
        <div
            className={`layout-container ${className}`}
            style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none" }}
        >
            <Header />
            <div className="layout-content">
                {children}
            </div>
            <Footer />
        </div>
    );
}
