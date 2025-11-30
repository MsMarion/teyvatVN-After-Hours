// src/App.jsx

/**
 * Main Application Component
 * 
 * This component sets up the routing for the application using React Router.
 * It also wraps the application with necessary context providers (Auth, Character)
 * and the Toast notification provider.
 */

import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Import all your pages ---
import LandingPage from "./pages/LandingPage.jsx";
import LoadingPage from "./pages/LoadingPage.jsx";
import CharacterPage from "./pages/CharacterPage.jsx";
import TestScenePage from "./pages/TestScenePage";
import PromptInputPage from "./pages/prompt_input_page.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";
import LayoutSamplePage from "./pages/LayoutSamplePage.jsx";
import CompleteRegistrationPage from "./pages/CompleteRegistrationPage.jsx"; // Import the new page
import LibraryPage from "./pages/LibraryPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import PlayPage from "./pages/PlayPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

import { CharacterProvider } from "./context/CharacterContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      {/* Context Providers wrap the application to provide global state */}
      <AuthProvider>
        <CharacterProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Public Routes - Accessible by anyone */}
            <Route path="/" element={<LoadingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
            <Route path="/layout_sample" element={<LayoutSamplePage />} />

            {/* Protected Routes - Require authentication */}
            {/* Wrapped in ProtectedRoute component which redirects to login if not authenticated */}
            <Route
              path="/characters"
              element={
                <ProtectedRoute>
                  <CharacterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/story"
              element={
                <ProtectedRoute>
                  <StoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate"
              element={
                <ProtectedRoute>
                  <PromptInputPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editing"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/play"
              element={
                <ProtectedRoute>
                  <PlayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test_scene"
              element={
                <ProtectedRoute>
                  <TestScenePage />
                </ProtectedRoute>
              }
            />

            {/* 404 fallback - Matches any URL not defined above */}
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
      </AuthProvider>
    </Router>
  );
}

export default App;
