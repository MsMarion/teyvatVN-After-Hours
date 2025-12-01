/**
 * API Configuration
 * 
 * This file contains the base URLs for our backend server.
 * By defining them here, we can easily change them in one place if our server moves
 * (e.g., from localhost to a real website).
 */

// The main address of our backend server.
// "http://localhost:8000" means it's running on your own computer on port 8000.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// A specific endpoint used for story generation (legacy constant, might be used in some older files)
export const API_URL = `${API_BASE_URL}/api/generate`;
