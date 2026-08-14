import { chatClient } from "../lib/stream.js";
import { ENV } from "../lib/env.js";

// generating token for stream so that we can have chats and uses clerk to authenticate
export async function getStreamToken(req, res) {
    try {
        // use clerkId for stream so it matches the id we have in stream
        const token = chatClient.createToken(req.user.clerkId);
        res.status(200).json({
            token,
            apiKey: ENV.STREAM_API_KEY,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.image,
        });
    } catch (error) {
        console.log("error in getStream controller", error.message);
        res.status(500).json({ message: "error getting stream token" });
    }
}