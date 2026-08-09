import { getAuth } from '@clerk/express'
import User from '../models/User.js'

export const protectRoute = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.redirect('https://code-room-nu.vercel.app/');
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({ msg: 'user not found in database' });
        }

        // attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.log("Error in ProtectRoute", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};