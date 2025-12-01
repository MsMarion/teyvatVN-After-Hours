import axios from "axios";
import { API_URL } from "../config/api";

/**
 * Axios Instance Configuration
 * 
 * 'axios' is a library we use to send requests to our backend server (API).
 * Instead of configuring it every time we want to fetch data, we create a pre-configured "instance".
 * 
 * This instance automatically:
 * 1. Knows the base URL of our server.
 * 2. Sets the content type to JSON.
 * 3. Attaches the user's login token to every request (via an "interceptor").
 */

const axiosInstance = axios.create({
    // The base URL for all requests. We strip "/api/generate" if it was accidentally included in the config.
    baseURL: API_URL.replace("/api/generate", ""),
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request Interceptor
 * 
 * Think of this as a checkpoint that every request must pass through before leaving the app.
 * We use it to automatically attach the "Authorization" header if the user is logged in.
 */
axiosInstance.interceptors.request.use(
    (config) => {
        // 1. Check if we have a token saved in local storage
        const token = localStorage.getItem("authToken");
        console.log("Interceptor: Found token:", token);

        // 2. If a token exists, add it to the request headers
        // This tells the backend: "Hey, it's me! Here's my ID badge."
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        console.log("Interceptor: Sending headers:", config.headers);
        return config;
    },
    (error) => {
        // If something goes wrong setting up the request, just pass the error along.
        return Promise.reject(error);
    }
);

export default axiosInstance;
