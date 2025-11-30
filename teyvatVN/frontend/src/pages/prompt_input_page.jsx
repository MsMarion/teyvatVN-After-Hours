import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import api from "../api/axios"; // Import the shared Axios instance

export default function PromptInputPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);


  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // The username is no longer needed in the request body.
      // The backend will get the user from the JWT.
      const response = await api.post("/api/generate", {
        prompt: prompt,
      });

      const result = response.data;

      // Save to localStorage for TestScenePage to display
      localStorage.setItem("latestResult", JSON.stringify(result.data));
      localStorage.setItem("latestPrompt", prompt);

      // Navigate to test scene page
      navigate("/test_scene");

    } catch (err) {
      console.error("Generation error:", err);
      setError(err.response?.data?.detail || err.message || "Failed to generate scene. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Prompt Generator</h2>

      <textarea
        className="w-full h-40 p-3 border rounded bg-gray-800 text-white"
        placeholder="Enter your story prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
      />

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

      {error && (
        <div className="mt-4 p-4 bg-red-900 text-red-200 rounded">
          {error}
        </div>
      )}

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
