import { StreamVideoClient } from "@stream-io/video-react-sdk";

const API_KEY = import.meta.env.VITE_STREAM_API_KEY;

let client = null;

export const initializeStreamClient = async (user, token, apiKey) => {
    // if client exists with same user instead of creating again, return it
    if (client && client?.user?.id === user.id) return client;

    const streamKey = apiKey || import.meta.env.VITE_STREAM_API_KEY;

    if (client) {
        await disconnectStreamClient();
    }

    if (!streamKey) throw new Error("Stream API Key is not provided");

    client = new StreamVideoClient({
        apiKey: streamKey,
        user,
        token,
    });
    return client;
};

// Aliases to handle naming typos gracefully
export const initializeTreaemClient = initializeStreamClient;

export const disconnectStreamClient = async () => {
    if (client) {
        try {
            await client.disconnectUser();
            client = null;
        } catch (error) {
            console.log("Error disconnecting stream client:", error);
        }
    }
};

export const disconnectedStreamClient = disconnectStreamClient;
