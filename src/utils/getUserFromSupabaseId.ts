import prisma from "./prismaClient";

export const getUserFromSupabaseId = async (supabaseId: string) => {
    if (!supabaseId) {
        throw new Error("Invalid Supabase ID");
    }

    const user = await prisma.user.findUnique({
        where: {
            supabaseId
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};
