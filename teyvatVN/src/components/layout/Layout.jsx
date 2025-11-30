import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "../../styles/Layout.css";

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
