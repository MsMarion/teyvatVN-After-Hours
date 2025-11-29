import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import "./LayoutSamplePage.css";
import pageBg from "../assets/background/goodNews.jpg";

export default function LayoutSamplePage() {
    return (
        <div
            className="layout-sample-container"
            style={{ backgroundImage: `url(${pageBg})` }}
        >
            {/* Navbar Header System from StoryPage.jsx */}
            <Header />

            {/* Sample Content */}
            <main className="sample-content">
                <h1>Layout Sample Page</h1>
                <p>
                    This page demonstrates the navbar header system isolated from the Story Page.
                </p>
            </main>
        </div>
    );
}
