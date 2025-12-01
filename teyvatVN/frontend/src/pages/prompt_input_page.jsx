import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // Import the shared Axios instance

/**
 * Prompt Input Page Component
 * 
 * This is a simple page where users can type a prompt to generate a story.
 * It's likely a prototype or testing page, as the main story generation 
 * happens on the 'StoryPage'.
 */
export default function PromptInputPage() {
  // --- State Management ---
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // --- Side Effects ---
  // Check if user is logged in when the page loads
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);


  /**
   * Handles the form submission to generate a story.
   */
  const handleGenerate = async () => {
    // 1. Basic validation: Don't submit empty prompts
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Send the prompt to the backend API
      // We use the 'api' instance which automatically handles the base URL and auth tokens
      const response = await api.post("/api/generate", {
        prompt: prompt,
      });

      const result = response.data;

      // 3. Save the result to local storage
      // This allows the next page (TestScenePage) to read the generated data
      localStorage.setItem("latestResult", JSON.stringify(result.data));
      localStorage.setItem("latestPrompt", prompt);

      // 4. Navigate to the page that displays the result
      navigate("/test_scene");

    } catch (err) {
      console.error("Generation error:", err);
      // Display a user-friendly error message
      setError(err.response?.data?.detail || err.message || "Failed to generate scene. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Prompt Generator</h2>

      {/* Text Area for User Input */}
      <textarea
        className="w-full h-40 p-3 border rounded bg-gray-800 text-white"
        placeholder="Enter your story prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
      />

      {/* Submit Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded ${loading
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700"
          } text-white`}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {/* Error Message Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-900 text-red-200 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-6 p-4 bg-gray-900 text-blue-400 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
            <span>Generating your visual novel scene...</span>
          </div>
        </div>
      )}
    </div>
  );
}
