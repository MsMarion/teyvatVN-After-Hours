import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (window.authDebugLogs) window.authDebugLogs.push({ msg: "ProtectedRoute: Checking auth", data: { user, loading }, time: new Date().toISOString() });
    console.log("ProtectedRoute: Checking auth", { user, loading });

    if (loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    // Check both user state and localStorage to prevent race conditions during login/redirect
    const token = localStorage.getItem("authToken");

    if (!user && !token) {
        if (window.authDebugLogs) window.authDebugLogs.push({ msg: "ProtectedRoute: No user or token, redirecting to login", time: new Date().toISOString() });
        console.log("ProtectedRoute: No user or token, redirecting to login");
        // Redirect to login page but save the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
