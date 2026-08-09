import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,  // browser will send the cookies to server automatically, opn every single request 
});

export default axiosInstance;