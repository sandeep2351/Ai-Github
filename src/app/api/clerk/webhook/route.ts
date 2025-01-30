import { db } from "@/server/db";

export const POST = async (req: Request) => {
    try {
        const { data } = await req.json();
        console.log('Clerk webhook received', data);

        const emailAddress = data.email_addresses[0].email_address;
        const firstName = data.first_name;
        const lastName = data.last_name;
        const imageUrl = data.image_url;
        const id = data.id;

        const user = await db.user.upsert({
            where: { emailAddress },
            update: {
                firstName,
                lastName,
                imageUrl,
                updatedAt: new Date(), 
            },
            create: {
                id,
                emailAddress,
                firstName,
                lastName,
                imageUrl,
            },
        });

        console.log('User upserted:', user);

        return new Response('Webhook data received', { status: 200 });
    } catch (error) {
        console.error('Error handling Clerk webhook:', error);
        return new Response('Error processing webhook', { status: 500 });
    }
};
