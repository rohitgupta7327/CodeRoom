import { Inngest } from "inngest";
import { serve } from "inngest/express";
import mongoose from "mongoose";
import dns from "dns";

// Set custom DNS servers to prevent DNS SRV resolution issues on Vercel/Windows
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // Ignore if not supported in environment
}

const DB_URL = process.env.DB_URL;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    if (!DB_URL) throw new Error("DB_URL environment variable is missing");
    await mongoose.connect(DB_URL);
};

// User Schema fallback for serverless endpoint
const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profileImage: { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export const inngest = new Inngest({ id: "CodeRoom" });

const syncUser = inngest.createFunction(
    { id: "sync-user", triggers: [{ event: "clerk/user.created" }, { event: "user.created" }] },
    async ({ event }) => {
        await connectDB();
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const newUser = {
            clerkId: id,
            email: email_addresses[0]?.email_address,
            name: `${first_name ?? ""} ${last_name ?? ""}`,
            profileImage: image_url
        };
        await User.create(newUser);
    }
);

const deleteUserFromDB = inngest.createFunction(
    { id: "delete-user-from-db", triggers: [{ event: "clerk/user.deleted" }, { event: "user.deleted" }] },
    async ({ event }) => {
        await connectDB();
        const { id } = event.data;
        await User.deleteOne({ clerkId: id });
    }
);

export default serve({
    client: inngest,
    functions: [syncUser, deleteUserFromDB],
});
