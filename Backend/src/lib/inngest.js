import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { upsertStreamUser, deleteStreamUser } from "./stream.js";


export const inngest = new Inngest({
    id: "CodeRoom",
});

// Function 1: Sync created user
const syncUser = inngest.createFunction(
    {
        id: "sync-user",
        triggers: [
            { event: "clerk/user.created" },
            { event: "user.created" },
        ],
    },
    async ({ event, step }) => {
        const createdUser = await step.run("save-user-to-db", async () => {
            await connectDB();

            // Safely handle both event.data and nested event.data.data structures
            const payload = event.data?.data || event.data;
            const { id, email_addresses, first_name, last_name, image_url } = payload;

            if (!id) {
                throw new Error("Clerk User ID is missing in event payload");
            }

            const email = email_addresses?.[0]?.email_address;
            const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || "User";

            // findOneAndUpdate with upsert prevents duplicate key errors and creates/updates safely
            const user = await User.findOneAndUpdate(
                { clerkId: id },
                {
                    clerkId: id,
                    email: email,
                    name: name,
                    profileImage: image_url ?? "",
                },
                { upsert: true, new: true }
            ).lean();

            return user;
        });

        await step.run("sync-user-to-stream", async () => {
            await upsertStreamUser({
                id: createdUser.clerkId.toString(),
                name: createdUser.name,
                image: createdUser.profileImage,
            });
        });

        return { success: true, userId: createdUser._id };
    }
);

// Function 2: Delete user from DB
const deleteUserFromDB = inngest.createFunction(
    {
        id: "delete-user-from-db",
        triggers: [
            { event: "clerk/user.deleted" },
            { event: "user.deleted" },
        ],
    },
    async ({ event, step }) => {
        const result = await step.run("remove-user-from-db", async () => {
            await connectDB();

            // Extract ID safely across payload formats
            const payload = event.data?.data || event.data;
            const targetId = payload?.id;

            if (!targetId) {
                throw new Error("Clerk User ID is missing in deletion event payload");
            }

            // Delete by clerkId (and fallback to clearkId if old misspelled documents exist)
            await User.deleteOne({
                $or: [{ clerkId: targetId }, { clearkId: targetId }],
            });

            return {
                targetId: targetId,
            };
        });

        // delete user from stream 
        await step.run("delete-user-from-stream", async () => {
            await deleteStreamUser(result.targetId.toString());
        });

        return { success: true, result };


        // we can send a welcome email here later
    }
);

export const functions = [syncUser, deleteUserFromDB];