import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/layout/Layout";
import pageBg from "../assets/background/goodNews.jpg";
import "../styles/LoginPage.css";

/**
 * Login Page Component
 * 
 * Handles user authentication (login and registration).
 * Supports both username/password and Google OAuth login.
 * Redirects to the previous page or character selection after successful login.
 */
export default function LoginPage() {
  // --- State Management ---
  // 'isRegistering' toggles between the Login form and the Registration form.
  const [isRegistering, setIsRegistering] = useState(false);

  // Form fields state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");   // Add email state
  const [apiKey, setApiKey] = useState(""); // Optional API key for new users

  // --- Hooks ---
  // 'useAuth' gives us access to the authentication functions defined in AuthContext.
  const { login, register, googleLogin, setToken, setUser } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to send the user after login.
  // If they were redirected here from a protected page, send them back there.
  // Otherwise, default to the character selection page.
  const from = location.state?.from?.pathname || "/characters";

  // --- Side Effects ---
  // Effect: Handle Google OAuth2 callback
  // When Google redirects back to our app, it includes a token in the URL parameters.
  // We need to capture this token to log the user in.
  useEffect(() => {
    // Handle Google OAuth2 callback
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const usernameFromGoogle = params.get("username");

    if (token && usernameFromGoogle) {
      // Update global auth state
      setToken(token);
      setUser(usernameFromGoogle);

      // Persist to localStorage so the user stays logged in on refresh
      localStorage.setItem("authToken", token);
      localStorage.setItem("currentUser", usernameFromGoogle);

      // Redirect to the intended destination
      navigate(from, { replace: true });
      // Clear URL parameters to prevent re-processing on refresh

      // Clean up the URL to remove the token (security & aesthetics)
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, navigate, from, setToken, setUser]);

  // --- Form Handling ---

  /**
   * Handles the form submission for both Login and Registration.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default browser page reload

    // Basic validation
    if (isRegistering) {
      if (!username || !password || !email) return;
    } else {
      if (!username || !password) return;
    }

    let success = false;

    // Call the appropriate function from AuthContext
    if (isRegistering) {
      success = await register(username, password, email, apiKey);
    } else {
      success = await login(username, password);
    }

    if (success) {
      // Force a full page reload to ensure auth state is correctly picked up by all components
      // This is a robust way to ensure a clean state after login
      window.location.replace(from);
    }
  };

  return (
    <Layout backgroundImage={pageBg} className="login-page-container">
      <div className="login-card">
        <h1 className="login-title">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email field is only shown during registration */}
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          {/* API Key field is only shown during registration */}
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Gemini API Key (Optional)</label>
              <input
                type="text"
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="form-input"
                placeholder="Enter your Gemini API Key"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            {isRegistering ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="social-login-options">
          <button onClick={googleLogin} className="google-login-btn">
            Login with Google
          </button>
        </div>

        <div className="toggle-text">
          {isRegistering ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="toggle-btn"
          >
            {isRegistering ? "Log In" : "Register"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
