import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "./env.js";

// Bypass local ISP/Router DNS blocks for MongoDB Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    // fallback if setServers throws
}

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const conn = await mongoose.connect(ENV.DB_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = conn.connections[0].readyState === 1;
        console.log("Connected to MongoDB:", conn.connection.host);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
};