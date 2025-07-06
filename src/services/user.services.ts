import prisma from "../utils/prismaClient";
import supabaseAdmin from "../utils/supabaseAdmin";

class UserService {

    static createUser = async (id : string) => {
        const now = new Date();

        const userData = await supabaseAdmin.auth.admin.getUserById(id);

        if (!userData) {
            return {createdUser : null, newCreated : false};
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                supabaseId: userData.data.user?.id
            }
        });

        if (existingUser) {
            return {createdUser : existingUser, newCreated : false};
        }

        const user = await prisma.user.create({
            data: {
                supabaseId: userData.data.user?.id,
                name: userData.data.user?.user_metadata.name || "",
                email: userData.data.user?.email || "",
                phone: userData.data.user?.user_metadata.phone || "",
                createdAt: now,
                updatedAt: now
            }
        });
        
        return {createdUser : user, newCreated : true};
    };

};

export default UserService;