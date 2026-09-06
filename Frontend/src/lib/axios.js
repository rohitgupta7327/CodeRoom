import axios from "axios";

let apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
if (apiBaseUrl && !apiBaseUrl.endsWith("/api") && !apiBaseUrl.endsWith("/api/")) {
    apiBaseUrl = apiBaseUrl.replace(/\/$/, "") + "/api";
}

const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

// Interceptor to attach Clerk Session Token to every request for cross-origin Vercel compatibility
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            if (typeof window !== "undefined" && window.Clerk?.session) {
                const token = await window.Clerk.session.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error("Error attaching Clerk token to request:", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;