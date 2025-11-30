import React, { useEffect, useRef } from "react";
// --- CHANGED: We now use Link from 'react-scroll' for smooth scrolling anchors ---
import { Link as ScrollLink, scroller } from "react-scroll";
import { Link as RouterLink } from "react-router-dom"; // Keep this for page navigation
import "../styles/LandingPage.css";

import heroVideo from "../assets/background/movingBG.mp4";

// --- Character and Icon Imports ---
import kaeyaImg from "../assets/character-sprites/kaeya.png";
import jeanImg from "../assets/character-sprites/jean.png";
import keqingImg from "../assets/character-sprites/keqing.png";
import sucroseImg from "../assets/character-sprites/sucrose.png";
import quillIcon from "../assets/images/quill.png";
import dividerGif from "../assets/images/73310135223dfdf5bc92d661b554fc51.gif";
import paimonFloat1 from "../assets/images/paimonFloat1.gif";
import paimonFloat2 from "../assets/images/paimonFloat2.gif";
import storyExample from '../assets/images/story-example.png';
import Footer from "../components/layout/Footer";

import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const videoRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    // ... existing useEffect code ...
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
      }

      // --- CHANGED: Use the scroller to animate over a custom duration ---
      scroller.scrollTo("mainContent", {
        // The name must match the element's 'name' or 'id' prop
        duration: 1000, // Duration in milliseconds (1 second)
        delay: 0,
        smooth: "easeInOutCubic", // Easing function for a nice effect
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <header className="header">
        <div className="logo">teyvat.vn</div>
        <nav className="nav-links">
          {/* --- CHANGED: These are now ScrollLink components --- */}
          <ScrollLink to="how-to" smooth={true} duration={800}>
            How To Play
          </ScrollLink>
          <ScrollLink to="about" smooth={true} duration={800}>
            About
          </ScrollLink>
          <RouterLink to="/library">
            Library
          </RouterLink>
          <RouterLink to="/characters" className="nav-cta">
            Start Story
          </RouterLink>
          {user ? (
            <button onClick={logout} className="nav-link-btn" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: '500' }}>
              Logout
            </button>
          ) : (
            <RouterLink to="/login">
              Login
            </RouterLink>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <video ref={videoRef} className="hero-video" autoPlay muted playsInline>
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-content">
          <h1>Your story. Their world. Any universe.</h1>
          <p>
            Create custom Genshin Impact visual novel fanfics with endless
            possibilities — powered by Google Gemini ✦
          </p>
          <RouterLink to="/characters" className="hero-button">
            → Choose Your Duo to Begin
          </RouterLink>
        </div>
      </section>

      {/* We add a 'name' prop here for the scroller to find */}
      <main name="mainContent" className="main-content">
        {/* How To Play Section */}
        <section className="floating-gifs-wrapper">
          <img
            src={paimonFloat1}
            alt="Floating Paimon Left"
            className="floating-gif left"
          />
          <div className="vertical-divider"></div>
          <img
            src={paimonFloat2}
            alt="Floating Paimon Right"
            className="floating-gif right"
          />
        </section>

        <section id="how-to" className="how-to-section">
          <div className="how-to-grid">
            <div className="how-to-text">
              <h2>How To Play</h2>
              <p>
                Dive into your own fan-made Genshin story in just a few steps:
              </p>
              <ol className="steps-list">
                <li>
                  <strong>Choose 2 Characters</strong> - Pick your Genshin duo
                  to star in the story.
                </li>
                <li>
                  <strong>Set the Scene</strong> - Type in any setting you can
                  imagine – no limits.
                </li>
                <li>
                  <strong>Generate & Play</strong> - Watch your AI-powered
                  visual novel unfold with dynamic dialogue and choices.
                </li>
                <li>
                  <strong>Branch the Story</strong> - Make decisions to shape
                  the plot – or regenerate for a new twist!
                </li>
                <li>
                  <RouterLink to="/characters" className="start-now-btn">
                    Start now!
                  </RouterLink>
                </li>
              </ol>
            </div>

            <div className="how-to-image">
              <img src={storyExample} alt="Screenshot of the story page in use" />
            </div>
          </div>
        </section>

        <section className="divider-section">
          <div className="divider-button">
            <img src={dividerGif} alt="Animated separator" />
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="about-section">
          <h2>About Us</h2>
          <p>
            Thanks for checking out our project! We're four UCF students
            majoring in Computer Science, Engineering, IT, and Digital Media who
            teamed up to build something fun (and a little unhinged), just like
            us. Click our names to view our portfolios or GitHub profiles — we’d
            love to connect!
          </p>
          <p className="disclaimer">
            <em>teyvat.vn</em> is a non-commercial fan project, unaffiliated
            with Genshin Impact, HoYoverse, or miHoYo. All assets belong to
            their respective owners.
          </p>

          <div className="team-grid">
            <div className="team-member">
              <img src={kaeyaImg} alt="Amana's character" />
              <a href="https://github.com/rockbison1230" target="_blank" rel="noopener noreferrer">
                Amana
              </a>
            </div>
            <div className="team-member">
              <img src={jeanImg} alt="Dawn's character" />
              <a href="https://github.com/MsMarion" target="_blank" rel="noopener noreferrer">
                Dawn
              </a>
            </div>
            <div className="team-member">
              <img src={keqingImg} alt="Lily's character" />
              <a href="https://www.lsvrionis.dev/" target="_blank" rel="noopener noreferrer">
                Lily
              </a>
            </div>
            <div className="team-member">
              <img src={sucroseImg} alt="Cami's character" />
              <a href="https://github.com/protko-1103" target="_blank" rel="noopener noreferrer">
                Cami
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
