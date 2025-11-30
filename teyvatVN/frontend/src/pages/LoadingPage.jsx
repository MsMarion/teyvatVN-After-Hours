import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/loading.css";
import quillImage from "../assets/images/quill.png";

/**
 * Loading Page Component
 * 
 * Displays a loading animation with a quill icon and text.
 * Automatically redirects to the landing page after a short delay.
 */
export default function LoadingPage() {
  const navigate = useNavigate();
  // State to control the fade-out animation
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Timer to start the fade-out after 1 second
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000); // 1 second delay

    // Timer to navigate to the landing page AFTER the fade animation completes
    const navigateTimer = setTimeout(() => {
      navigate("/landing");
    }, 2200);

    // Cleanup function to clear timers if the component unmounts
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    // Conditionally apply the 'fading-out' class to trigger the animation
    <div className={`loading-container ${isFadingOut ? "fading-out" : ""}`}>
      <img src={quillImage} alt="Quill" className="quill-image" />
      <h1 className="loading-text">Rewrite the lore, your way!</h1>
    </div>
  );
}
