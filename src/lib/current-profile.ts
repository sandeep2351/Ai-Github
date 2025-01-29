import { db } from "@/server/db";
import { currentUser } from "@clerk/nextjs/server";

export const currentProfile = async () => {
    // Get the current user from Clerk
    const user = await currentUser();

    // If the user is not authenticated, return null
    if (!user) {
        return null;
    }

    // Check if the user has emailAddresses and at least one email
    const emailAddress = user.emailAddresses?.[0]?.emailAddress;

    // If the email is missing or invalid, return null
    if (!emailAddress) {
        return null;
    }

    // Fetch the user profile from the database based on email address
    const profile = await db.user.findFirst({
        where: {
            emailAddress,
        },
    });

    // Return the profile or null if not found
    return profile;
};
