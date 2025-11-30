import React from "react";
import Layout from "../components/layout/Layout";
import "./LayoutSamplePage.css";
import pageBg from "../assets/background/goodNews.jpg";

export default function LayoutSamplePage() {
    return (
        <Layout className="layout-sample-container" backgroundImage={pageBg}>
            {/* Sample Content */}
            <main className="sample-content">
                <h1>Layout Sample Page</h1>
                <p>
                    This page demonstrates the navbar header system isolated from the Story Page.
                </p>
            </main>
        </Layout>
    );
}
