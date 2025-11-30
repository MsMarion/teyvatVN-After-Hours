import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Protected Route Component
 * 
 * This is a special "wrapper" component used to protect pages that require login.
 * It acts like a security guard:
 * 1. It checks if the user is logged in.
 * 2. If yes, it lets them through to the page they requested (`children`).
 * 3. If no, it kicks them back to the login page.
 */
export default function ProtectedRoute({ children }) {
    // Get the current user status and loading state from our AuthContext
    const { user, loading } = useAuth();

    // Get the current URL location so we can remember where the user wanted to go
    const location = useLocation();

    // Debug logging (helpful for developers to trace what's happening)
    if (window.authDebugLogs) window.authDebugLogs.push({ msg: "ProtectedRoute: Checking auth", data: { user, loading }, time: new Date().toISOString() });
    console.log("ProtectedRoute: Checking auth", { user, loading });

    // 1. Loading State
    // If we are still checking if the user is logged in (e.g., waiting for local storage),
    // show a loading message instead of redirecting immediately.
    if (loading) {
        return <div>Loading...</div>; // You could replace this with a nice spinner component
    }

    // 2. Authentication Check
    // We check both the 'user' object in state and the 'authToken' in localStorage.
    // Checking localStorage directly is a safety net to prevent accidental redirects 
    // if the state hasn't updated yet (race conditions).
    const token = localStorage.getItem("authToken");

    if (!user && !token) {
        if (window.authDebugLogs) window.authDebugLogs.push({ msg: "ProtectedRoute: No user or token, redirecting to login", time: new Date().toISOString() });
        console.log("ProtectedRoute: No user or token, redirecting to login");

        // 3. Redirect Logic
        // The user is NOT logged in. Send them to the "/login" page.
        // We pass `state={{ from: location }}` so the Login page knows where to send them back 
        // after they successfully log in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 4. Access Granted
    // The user is logged in! Render the protected content (the 'children').
    return children;
}
