import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";
import pageBg from "../assets/background/goodNews.jpg";
import "../styles/LoginPage.css";

/**
 * Complete Registration Page Component
 * 
 * This page is the final step of the Google Login process for NEW users.
 * 
 * Flow:
 * 1. User clicks "Login with Google".
 * 2. Google authenticates them and sends them back to our backend.
 * 3. Our backend sees this email is new (not in our database).
 * 4. Backend creates a temporary "partial token" and redirects the user HERE.
 * 5. This page asks the user to pick a username (since Google doesn't give us one we like).
 * 6. We send the username + partial token back to the server to finalize the account.
 */
export default function CompleteRegistrationPage() {
    // --- State Management ---
    const [username, setUsername] = useState("");
    const [partialToken, setPartialToken] = useState(null); // The temporary token from the backend
    const [email, setEmail] = useState(""); // User's email extracted from the token
    const [apiKey, setApiKey] = useState(""); // Optional API key for new users
    const [loading, setLoading] = useState(false);

    // --- Hooks ---
    const { setToken, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // --- Side Effects ---
    // Effect: Parse the URL to find the 'partial token'
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            try {
                // Decode the JWT token to see what's inside
                const decodedToken = jwtDecode(token);

                // Verify this is indeed a partial registration token
                if (decodedToken.scope === "partial_registration") {
                    setPartialToken(token);
                    setEmail(decodedToken.email); // Display email to user so they know who they are
                } else {
                    // If it's not the right kind of token, something is wrong.
                    toast.error("Invalid registration token.");
                    navigate("/login");
                }
            } catch (error) {
                toast.error("Invalid or expired registration token.");
                navigate("/login");
            }
        } else {
            toast.error("No registration token found.");
            navigate("/login");
        }
    }, [location, navigate]);

    // --- Form Handling ---

    /**
     * Submits the final registration data to the backend.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!username.trim()) {
            toast.error("Please choose a username.");
            return;
        }

        setLoading(true);
        try {
            // Send the partial token + new username to the backend
            const response = await api.post("/api/auth/complete-registration", {
                token: partialToken,
                username: username,
                gemini_api_key: apiKey,
            });

            // Success! The backend returns a real, full access token.
            const data = response.data;

            // Log the user in
            setToken(data.token);
            setUser(data.username);
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("currentUser", data.username);

            toast.success(`Welcome, ${data.username}! Your registration is complete.`);
            navigate("/characters"); // Redirect to the main app
        } catch (error) {
            console.error("Registration completion error:", error);
            toast.error(error.response?.data?.detail || "Failed to complete registration.");
        } finally {
            setLoading(false);
        }
    };

    // Don't render anything until we have validated the token
    if (!partialToken) {
        return null; // Or a loading spinner
    }

    return (
        <Layout backgroundImage={pageBg} className="login-page-container">
            <div className="login-card">
                <h1 className="login-title">Complete Your Registration</h1>
                <p className="login-description">
                    You're almost there! Choose a username to complete your account setup.
                </p>
                <p className="login-info">
                    Your email: <strong>{email}</strong>
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="Choose your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Gemini API Key (Optional)</label>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="form-input"
                            placeholder="Enter your Gemini API Key"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Completing..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
