import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "../../styles/Layout.css";

/**
 * Layout Component
 * 
 * This component acts as a "Frame" for every page in our application.
 * Instead of writing <Header> and <Footer> on every single page, we just use <Layout>.
 * 
 * It uses a special React prop called 'children'.
 * 'children' refers to whatever you put INSIDE the <Layout>...</Layout> tags.
 */
export default function Layout({ children, backgroundImage, className = "" }) {
    return (
        <div
            className={`layout-container ${className}`}
            // If a background image is provided, set it as the CSS background.
            // Otherwise, set it to "none" (or fallback to CSS defaults).
            style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none" }}
        >
            {/* The Header always appears at the top */}
            <Header />

            {/* The main content of the page goes here */}
            <div className="layout-content">
                {children}
            </div>

            {/* The Footer always appears at the bottom */}
            <Footer />
        </div>
    );
}
