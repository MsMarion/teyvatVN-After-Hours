import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import pageBg from "../assets/background/goodNews.jpg";
import "./LoginPage.css"; // Reuse login page styles

export default function CompleteRegistrationPage() {
    const [username, setUsername] = useState("");
    const [partialToken, setPartialToken] = useState(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { setToken, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.scope === "partial_registration") {
                    setPartialToken(token);
                    setEmail(decodedToken.email);
                } else {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            toast.error("Please choose a username.");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post("/api/auth/complete-registration", {
                token: partialToken,
                username: username,
            });

            const data = response.data;
            setToken(data.token);
            setUser(data.username);
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("currentUser", data.username);
            toast.success(`Welcome, ${data.username}! Your registration is complete.`);
            navigate("/characters"); // Redirect to main app
        } catch (error) {
            console.error("Registration completion error:", error);
            toast.error(error.response?.data?.detail || "Failed to complete registration.");
        } finally {
            setLoading(false);
        }
    };

    if (!partialToken) {
        return null; // Or a loading spinner
    }

    return (
        <Layout backgroundImage={pageBg} className="login-page-container">
            <div className="login-card">
                <h1 className="login-title">Complete Your Registration</h1>
                <p className="text-center text-gray-300 mb-4">
                    You're almost there! Choose a username to complete your account setup.
                </p>
                <p className="text-center text-gray-400 mb-6">
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

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Completing..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
