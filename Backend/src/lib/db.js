import mongoose from "mongoose"
import dns from "dns"
import { ENV } from "./env.js"

// Set custom DNS servers to prevent DNS SRV resolution issues on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {

    try {
        const conn = await mongoose.connect(ENV.DB_URL)
        console.log("connected to MongoDB:", conn.connection.host);
    }
    catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
        process.exit(1)
    }
};