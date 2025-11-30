import axios from "axios";
import { API_URL } from "../config/api";

const axiosInstance = axios.create({
    baseURL: API_URL.replace("/api/generate", ""),
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the token in all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        console.log("Interceptor: Found token:", token); // Add this log
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        console.log("Interceptor: Sending headers:", config.headers); // Add this log
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
