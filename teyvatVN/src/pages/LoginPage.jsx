import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import pageBg from "../assets/background/goodNews.jpg";
import "./LoginPage.css";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/characters";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    let success = false;
    if (isRegistering) {
      success = await register(username, password);
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
