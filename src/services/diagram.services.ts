import prisma from "../utils/prismaClient";

class DiagramService {
    static create = async (userId : string) => {
        if (!userId) {
            throw new Error("User is required");
        }
        const user = await prisma.user.findUnique({
            where : {supabaseId:  userId}
        })
        if(!user){
            throw new Error("User not found");
        }
        const now = new Date();
        const diagram = await prisma.diagram.create({
            data: {
                title: `Untitled_Diagram_${now}`,
                userId : user.id,
                createdAt: now,
                updatedAt: now,
                collaborators: [],
                elements: [],
            }
        });
        
        return diagram;

    }
};

export default DiagramService;