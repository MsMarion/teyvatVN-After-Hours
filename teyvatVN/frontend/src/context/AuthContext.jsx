import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios"; // Import axios
import { API_URL, API_BASE_URL } from "../config/api";

/**
 * Authentication Context
 * 
 * Provides authentication state (user, token) and methods (login, register, logout)
 * to the entire application.
 * 
 * Context allows us to share data (like who is logged in) with any component
 * in the app without passing props down manually through every level.
 */
const AuthContext = createContext(null);

// Create an Axios instance for API calls
// This sets up a base configuration for all our auth-related requests
const api = axios.create({
    baseURL: API_BASE_URL, // Base URL for authentication endpoints
    headers: {
        "Content-Type": "application/json",
    },
});

export const AuthProvider = ({ children }) => {
    // --- State Management ---
    // 'user' stores the current user's username. Null if not logged in.
    const [user, setUser] = useState(null);

    // 'token' stores the JWT (JSON Web Token) used to authenticate API requests.
    const [token, setToken] = useState(null);

    // 'loading' is true while we check if the user was previously logged in.
    const [loading, setLoading] = useState(true);

    // Debug logging helper
    if (!window.authDebugLogs) window.authDebugLogs = [];
    const log = (msg, data) => {
        console.log(msg, data);
        window.authDebugLogs.push({ msg, data, time: new Date().toISOString() });
    };

    // --- Side Effects ---
    // Effect: Check for stored token on initial load
    // This runs once when the app starts. It checks if the user has a token saved
    // in their browser's LocalStorage from a previous session.
    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("currentUser");
        log("AuthContext: Checking stored token:", storedToken);

        if (storedToken) {
            // Restore the session
            setToken(storedToken);
            if (storedUser) {
                setUser(storedUser);
                log("AuthContext: User restored from localStorage:", storedUser);
            } else {
                // Fallback if no user is stored but token exists
                setUser("Authenticated User");
                log("AuthContext: User restored with placeholder");
            }
        } else {
            log("AuthContext: No token found");
        }
        setLoading(false); // Finished checking
    }, []);

    // --- Auth Functions ---

    /**
     * Login function
     * Authenticates user with username and password.
     * Sends a POST request to the backend.
     */
    const login = async (username, password) => {
        try {
            // Send login request
            const response = await api.post("/api/auth/login", { username, password });
            const data = response.data;

            log("AuthContext: Login successful", data);

            // Update state with new user data
            setToken(data.token);
            setUser(data.username);

            // Save to localStorage for persistence
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("currentUser", data.username);

            toast.success(`Welcome back, ${data.username}!`);
            return true; // Success
        } catch (error) {
            log("AuthContext: Login failed", error);
            console.error("Login error:", error);
            toast.error(error.response?.data?.detail || error.message);
            return false; // Failure
        }
    };

    /**
     * Register function
     * Creates a new user account.
     * If successful, automatically logs the user in.
     */
    const register = async (username, password, email, apiKey) => {
        try {
            // Send registration request
            const response = await api.post("/api/auth/register", { username, password, email, gemini_api_key: apiKey });
            const data = response.data;

            if (response.status !== 200) {
                throw new Error(data.detail || "Registration failed");
            }

            toast.success("Account created! Logging you in...");
            // Automatically log in after successful registration
            return await login(username, password);
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.detail || error.message);
            return false;
        }
    };

    /**
     * Google Login function
     * Initiates the Google OAuth flow by redirecting the user to the backend's auth endpoint.
     * The backend will then redirect to Google's login page.
     */
    const googleLogin = async () => {
        try {
            // Redirect to backend's Google login endpoint
            const redirectUrl = `${API_BASE_URL}/api/auth/google/login`;
            console.log("Initiating Google Login redirect to:", redirectUrl);
            window.location.href = redirectUrl;
        } catch (error) {
            console.error("Google login initiation error:", error);
            toast.error("Failed to initiate Google login.");
        }
    };

    /**
     * Logout function
     * Clears user state and removes data from local storage.
     */
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, googleLogin, logout, loading, setToken, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily access the AuthContext from any component
export const useAuth = () => useContext(AuthContext);
