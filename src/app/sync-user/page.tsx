import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; 
import { notFound, redirect } from "next/navigation";

const SyncUser = async () => {
  try {
    console.log("Starting SyncUser...");

    const { userId } = await auth(); 
    console.log("Authenticated userId:", userId);

    if (!userId) {
      console.error("User not authenticated.");
      throw new Error("User not authenticated.");
    }

    const user = await clerkClient.users.getUser(userId); 
    console.log("User fetched from Clerk:", user);

    if (!user?.emailAddresses?.[0]?.emailAddress) {
      console.error("User does not have a valid email.");
      return notFound();
    }

    const emailAddress = user.emailAddresses[0].emailAddress;
    console.log("User emailAddress:", emailAddress);

    console.log("Starting database upsert...");
    const upsertedUser = await db.user.upsert({
      where: { emailAddress },
      update: {
        imageUrl: user.imageUrl || "",
        lastName: user.lastName || "",
        firstName: user.firstName || "",
      },
      create: {
        emailAddress,
        imageUrl: user.imageUrl || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
    });

    console.log("Database upsert successful:", upsertedUser);
    redirect("/dashboard");
  } catch (error) {
    console.error("Error during SyncUser:", error);
    throw error;
  }
};

export default SyncUser;
