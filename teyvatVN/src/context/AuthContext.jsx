import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios"; // Import axios
import { API_URL } from "../config/api";

const AuthContext = createContext(null);

// Create an Axios instance for API calls
const api = axios.create({
    baseURL: API_URL.replace("/api/generate", ""), // Base URL for authentication endpoints
    headers: {
        "Content-Type": "application/json",
    },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores username
    const [token, setToken] = useState(null); // Stores JWT
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            // In a real app, you'd decode the JWT to get user info or verify it with the backend
            // For now, we'll assume the token implies a logged-in state and try to get user info
            // This part will be improved with a proper JWT decode/verify
            setToken(storedToken);
            // Placeholder: In a real app, you'd decode the token to get the username
            // For now, we'll just set a generic user or fetch user details
            setUser("Authenticated User"); // This will be replaced by actual username from JWT
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post("/api/auth/login", { username, password });
            const data = response.data;

            setToken(data.token);
            setUser(data.username); // Backend still returns username
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("currentUser", data.username); // Store username for display
            toast.success(`Welcome back, ${data.username}!`);
            return true;
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.detail || error.message);
            return false;
        }
    };

    const register = async (username, password, email) => {
        try {
            const response = await api.post("/api/auth/register", { username, password, email });
            const data = response.data;

            if (response.status !== 200) { // FastAPI returns 200 even for errors sometimes, check detail
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
            window.location.href = `${API_URL.replace("/api/generate", "")}/api/auth/google/login`;
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
