import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const conn = await mongoose.connect(ENV.DB_URL, {
            serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of timing out Vercel
        });
        isConnected = conn.connections[0].readyState === 1;
        console.log("Connected to MongoDB:", conn.connection.host);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
};