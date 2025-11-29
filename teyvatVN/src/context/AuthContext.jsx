import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem("currentUser");
        const storedToken = localStorage.getItem("authToken");

        if (storedUser && storedToken) {
            setUser(storedUser);
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_URL.replace("/api/generate", "")}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed");
            }

            setUser(data.username);
            setToken(data.token);
            localStorage.setItem("currentUser", data.username);
            localStorage.setItem("authToken", data.token);
            toast.success(`Welcome back, ${data.username}!`);
            return true;
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.message);
            return false;
        }
    };

    const register = async (username, password) => {
        try {
            const response = await fetch(`${API_URL.replace("/api/generate", "")}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            toast.success("Account created! Logging you in...");
            // Auto login after register
            return await login(username, password);
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.message);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");
        // Also clear character selection on logout? Maybe not.
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
