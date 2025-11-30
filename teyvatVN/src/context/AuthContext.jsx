import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios"; // Import axios
import { API_URL, API_BASE_URL } from "../config/api";

const AuthContext = createContext(null);

// Create an Axios instance for API calls
const api = axios.create({
    baseURL: API_BASE_URL, // Base URL for authentication endpoints
    headers: {
        "Content-Type": "application/json",
    },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores username
    const [token, setToken] = useState(null); // Stores JWT
    const [loading, setLoading] = useState(true);

    if (!window.authDebugLogs) window.authDebugLogs = [];
    const log = (msg, data) => {
        console.log(msg, data);
        window.authDebugLogs.push({ msg, data, time: new Date().toISOString() });
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("currentUser");
        log("AuthContext: Checking stored token:", storedToken);

        if (storedToken) {
            // In a real app, you'd decode the JWT to get user info or verify it with the backend
            // For now, we'll assume the token implies a logged-in state and try to get user info
            // This part will be improved with a proper JWT decode/verify
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
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post("/api/auth/login", { username, password });
            const data = response.data;

            log("AuthContext: Login successful", data);
            setToken(data.token);
            setUser(data.username);
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("currentUser", data.username);
            toast.success(`Welcome back, ${data.username}!`);
            return true;
        } catch (error) {
            log("AuthContext: Login failed", error);
            console.error("Login error:", error);
            toast.error(error.response?.data?.detail || error.message);
            return false;
        }
    };

    const register = async (username, password, email) => {
        try {
            const response = await api.post("/api/auth/register", { username, password, email });
            const data = response.data;

            if (response.status !== 200) {
                throw new Error(data.detail || "Registration failed");
            }

            toast.success("Account created! Logging you in...");
            return await login(username, password);
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.detail || error.message);
            return false;
        }
    };

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

export const useAuth = () => useContext(AuthContext);
