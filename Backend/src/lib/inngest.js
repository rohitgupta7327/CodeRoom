import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";

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
            const { id, email_addresses, first_name, last_name, image_url } = event.data;

            const newUser = {
                clerkId: id,
                email: email_addresses?.[0]?.email_address,
                name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
                profileImage: image_url,
            };

            // .lean() returns a plain JavaScript object instead of a complex Mongoose document
            return await User.create(newUser).then((doc) => doc.toObject());
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
        await step.run("remove-user-from-db", async () => {
            await connectDB();
            const { id } = event.data;

            await User.deleteOne({ clerkId: id });
        });

        return { success: true };
    }
);

export const functions = [syncUser, deleteUserFromDB];