import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import pageBg from "../assets/background/goodNews.jpg";
import "./LoginPage.css";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Add email state
  const [apiKey, setApiKey] = useState(""); // Add API key state
  const { login, register, googleLogin, setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/characters";

  useEffect(() => {
    // Handle Google OAuth2 callback
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const usernameFromGoogle = params.get("username");

    if (token && usernameFromGoogle) {
      setToken(token);
      setUser(usernameFromGoogle);
      localStorage.setItem("authToken", token);
      localStorage.setItem("currentUser", usernameFromGoogle);
      navigate(from, { replace: true });
      // Clear URL parameters to prevent re-processing on refresh
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, navigate, from, setToken, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      if (!username || !password || !email) return;
    } else {
      if (!username || !password) return;
    }

    let success = false;
    if (isRegistering) {
      success = await register(username, password, email, apiKey);
    } else {
      success = await login(username, password);
    }

    if (success) {
      navigate(from, { replace: true });
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter your username"
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          {isRegistering && (
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
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
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
