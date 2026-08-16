import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Please sign in" });
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        // attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in ProtectRoute:", error);
        res.status(401).json({ message: "Unauthorized", error: error.message });
    }
};