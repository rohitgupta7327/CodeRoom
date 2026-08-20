import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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