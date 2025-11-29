// src/App.jsx

import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Import all your pages ---
import LandingPage from "./pages/LandingPage.jsx";
import LoadingPage from "./pages/LoadingPage.jsx"; // Added this import
import CharacterPage from "./pages/CharacterPage.jsx";
import TestScenePage from "./pages/TestScenePage";
import PromptInputPage from "./pages/prompt_input_page.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";

import { CharacterProvider } from "./context/CharacterContext.jsx";

function App() {
  return (
    <Router>
      <CharacterProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* --- FIXED: Now correctly renders the LoadingPage React component --- */}
          <Route path="/" element={<LoadingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Other Routes */}
          <Route path="/characters" element={<CharacterPage />} />
          <Route path="/test_scene" element={<TestScenePage />} />
          <Route path="/generate" element={<PromptInputPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/story" element={<StoryPage />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-red-800 text-white text-3xl">
                <h1>404 - Page Not Found</h1>
                <p className="text-xl mt-4">
                  The URL you requested does not exist.
                </p>
              </div>
            }
          />
        </Routes>
      </CharacterProvider>
    </Router>
  );
}

export default App;
