import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "./env.js";

// Set custom DNS servers to prevent DNS SRV resolution issues on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const conn = await mongoose.connect(ENV.DB_URL);
        isConnected = conn.connections[0].readyState === 1;
        console.log("connected to MongoDB:", conn.connection.host);
    } catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
        throw error;
    }
};