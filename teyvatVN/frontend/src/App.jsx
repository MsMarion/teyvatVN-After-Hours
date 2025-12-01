// src/App.jsx

/**
 * Main Application Component
 * 
 * This is the "root" component that holds our entire application together.
 * Think of it as the skeleton of the website.
 * 
 * Its main jobs are:
 * 1. **Routing**: Deciding which page to show based on the URL (e.g., show Login page when URL is /login).
 * 2. **Context Providers**: Wrapping the app with global data (like User Auth and Character choices) so every page can access them.
 * 3. **Notifications**: Setting up the 'Toaster' so we can pop up messages (like "Saved successfully!") anywhere.
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
import CompleteRegistrationPage from "./pages/CompleteRegistrationPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import PlayPage from "./pages/PlayPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

import { CharacterProvider } from "./context/CharacterContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

function App() {
  return (
    // <Router> enables navigation without reloading the page (Single Page Application behavior)
    <Router>

      {/* <AuthProvider> makes 'user' and 'login/logout' functions available everywhere */}
      <AuthProvider>

        {/* <CharacterProvider> makes 'selectedCharacters' available everywhere */}
        <CharacterProvider>

          {/* <Toaster> is the popup notification system. We place it here once, and it works globally. */}
          <Toaster position="top-center" />

          {/* <Routes> acts like a switch statement. It looks at the URL and picks ONE <Route> to render. */}
          <Routes>

            {/* --- Public Routes --- */}
            {/* These pages can be visited by anyone, even if they aren't logged in. */}

            <Route path="/" element={<LoadingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
            <Route path="/layout_sample" element={<LayoutSamplePage />} />

            {/* --- Protected Routes --- */}
            {/* These pages require the user to be logged in. */}
            {/* We wrap them in <ProtectedRoute>. If the user isn't logged in, ProtectedRoute kicks them to /login. */}

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

            {/* --- 404 Not Found --- */}
            {/* The path="*" matches ANYTHING that wasn't matched above. */}
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
