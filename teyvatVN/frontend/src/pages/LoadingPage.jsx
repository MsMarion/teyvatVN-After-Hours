import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/loading.css";
import quillImage from "../assets/images/quill.png";

/**
 * Loading Page Component
 * 
 * Displays a splash screen with a loading animation (quill icon and text).
 * It automatically redirects the user to the Landing Page after a short delay.
 * This is typically used as the initial entry point of the application.
 */
export default function LoadingPage() {
  const navigate = useNavigate();

  // --- State Management ---
  // 'isFadingOut' is a boolean flag.
  // When true, we add a CSS class to the container to trigger a fade-out animation.
  const [isFadingOut, setIsFadingOut] = useState(false);

  // --- Side Effects ---
  // This effect runs once when the component mounts (appears on screen).
  useEffect(() => {
    // 1. Start the fade-out animation after 1 second (1000ms).
    // This gives the user time to see the logo before it disappears.
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000);

    // 2. Navigate to the landing page after 2.2 seconds (2200ms).
    // This allows time for the fade-out animation (defined in CSS) to complete.
    const navigateTimer = setTimeout(() => {
      navigate("/landing");
    }, 2200);

    // Cleanup function:
    // If the user leaves this page before the timers finish (e.g., hits back button),
    // we clear the timers to prevent errors or unexpected navigation.
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    // The container div gets the 'fading-out' class only when isFadingOut is true.
    // This class is responsible for the CSS transition (opacity: 0).
    <div className={`loading-container ${isFadingOut ? "fading-out" : ""}`}>
      <img src={quillImage} alt="Quill" className="quill-image" />
      <h1 className="loading-text">Rewrite the lore, your way!</h1>
    </div>
  );
}
