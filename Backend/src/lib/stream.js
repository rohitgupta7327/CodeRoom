import { StreamChat } from "stream-chat"
import { ENV } from "./env.js"

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_API_SECRET

if (!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

// create and update data 
export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData)
        console.log("Stream user created/updated sucessfully", userData);
        return userData
    }
    catch (error) {
        console.error("Error upserting user:", error)
        throw error
    }
}
export const deleteStreamUser = async (userId) => {
    try {
        await chatClient.deleteUser(userId)
        console.log("Stream user deleted sucessfully", userId);
    }
    catch (error) {
        console.error("Error deleting the Stream user:", error);
        throw error
    }
}

// todo : add another method to generate tokens
