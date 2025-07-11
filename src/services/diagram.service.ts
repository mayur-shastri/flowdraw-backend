import prisma from "../utils/prismaClient";

class DiagramService {
    static create = async (userSupabaseId: string) => {
        if (!userSupabaseId) {
            throw new Error("User is required");
        }
        const user = await prisma.user.findUnique({
            where: { supabaseId: userSupabaseId }
        })
        if (!user) {
            throw new Error("User not found");
        }
        const now = new Date();
        const diagram = await prisma.diagram.create({
            data: {
                title: `Untitled_Diagram_${now}`,
                userId: user.id,
                createdAt: now,
                updatedAt: now,
                elements: [],
            }
        });

        return diagram;

    };

    static getDiagram = async (id: string, diagramId: string) => {
        if (!id || !diagramId) {
            throw new Error("User ID and Diagram ID are required");
        }

        const diagram = await prisma.diagram.findUnique({
            where: {
                id: diagramId,
                userId: id
            }
        });

        if (!diagram) {
            throw new Error("Diagram not found");
        }

        if(diagram.userId === id) return diagram;

        const collaboration = await prisma.collaboration.findUnique({
            where: {
                userId_diagramId: {
                    userId: id,
                    diagramId: diagramId
                }
            }
        });

        const viewOnlyCollaboration = await prisma.viewOnlyCollaboration.findUnique({
            where: {
                userId_diagramId: {
                    userId: id,
                    diagramId: diagramId
                }
            }
        });

        if (!collaboration && !viewOnlyCollaboration) {
            throw new Error("You do not have access to this diagram");
        }

        return diagram;

    };

    static getUserDiagrams = async (userSupabaseId: string) => {
        if (!userSupabaseId) {
            throw new Error("User ID is required");
        }
        
        const user = await prisma.user.findUnique({
            where : {
                supabaseId: userSupabaseId
            }
        });

        const userId = user?.id;

        const userDiagrams = await prisma.diagram.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return userDiagrams;

    };

    static getUserCollaborations = async (userId: string) => {
        if (!userId) {
            throw new Error("User ID is required");
        }

        const userCollaborations = await prisma.diagram.findMany({
            where: {
                collaborators: {
                    some: {
                        userId: userId
                    }
                }
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return userCollaborations;

    };

    static getUserViewOnlyDiagrams = async (userId: string) => {
        if (!userId) {
            throw new Error("User ID is required");
        }

        const viewOnlyCollaborations = await prisma.diagram.findMany({
            where: {
                viewOnlyCollaborators: {
                    some: {
                        userId: userId
                    }
                }
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return viewOnlyCollaborations;

    };

};

export default DiagramService;