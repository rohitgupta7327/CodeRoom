import { chatClient } from "../lib/stream.js";
import { StreamChat } from "stream-chat";

// generating token for stream so that we can have chats and uses clrek to authenticated
export async function getStreamToken(req, res) {

    try {
        // use clerkId for stream nor {MongoDB_Id}=> it should match the id we have in stream 
        const token = chatClient.createToken(req.user.clerkId)
        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.image
        });
    } catch (error) {
        console.log("error in getStream controller", error.message);
        res.status(500).json({ message: "error getting stream token" })
    }
}