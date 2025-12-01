import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * 
 * This is a utility component that fixes a common issue in Single Page Applications (SPAs).
 * When you navigate from one page to another in a normal website, the browser reloads and starts at the top.
 * In React SPAs, the page doesn't reload, so if you were scrolled down on the old page, 
 * you stay scrolled down on the new page.
 * 
 * This component listens for page changes and forces the window to scroll back to the top (0, 0).
 */
function ScrollToTop() {
  // 'useLocation' gives us the current URL path (e.g., "/login", "/story")
  const { pathname } = useLocation();

  // This effect runs every time 'pathname' changes (i.e., every time we navigate)
  useEffect(() => {
    // Scroll the window to x=0, y=0 (top left corner)
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component doesn't render anything visible, so we return null
  return null;
}

export default ScrollToTop;
