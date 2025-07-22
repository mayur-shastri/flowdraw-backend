import { getUserFromSupabaseId } from "../utils/getUserFromSupabaseId";
import prisma from "../utils/prismaClient";

class DiagramService {

    static create = async (userSupabaseId: string) => {
        const user = await getUserFromSupabaseId(userSupabaseId);
        const now = new Date();
        const id = crypto.randomUUID().slice(0, 8);
        const title = `Untitled_Diagram_${id}`;
        const diagram = await prisma.diagram.create({
            data: {
                title: title,
                userId: user.id,
                createdAt: now,
                updatedAt: now,
                elements: [],
                connections: []
            }
        });

        return diagram;

    };

    static getDiagram = async (userSupabaseId: string, diagramId: string) => {
        if (!userSupabaseId || !diagramId) {
            throw new Error("User ID and Diagram ID are required");
        }

        const user = await getUserFromSupabaseId(userSupabaseId);

        const diagram = await prisma.diagram.findUnique({
            where: {
                id: diagramId,
                userId: user.id
            }
        });

        if (!diagram) {
            throw new Error("Diagram not found");
        }

        if (diagram.userId === user.id) return diagram;

        const collaboration = await prisma.collaboration.findUnique({
            where: {
                userId_diagramId: {
                    userId: user.id,
                    diagramId: diagramId
                }
            }
        });

        if (!collaboration) {
            throw new Error("You do not have access to this diagram");
        }

        return diagram;

    };

    static getUserDiagrams = async (userSupabaseId: string) => {

        const user = await getUserFromSupabaseId(userSupabaseId);

        const userDiagrams = await prisma.diagram.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return userDiagrams;

    };

    static getUserCollaborations = async (userSupabaseId: string) => {

        const user = await getUserFromSupabaseId(userSupabaseId);

        const userCollaborations = await prisma.diagram.findMany({
            where: {
                collaborators: {
                    some: {
                        userId: user.id
                    }
                }
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return userCollaborations;

    };

    static updateDiagram = async (userSupabaseId: string, diagramId: string, updatedElements: Array<any>, updatedConnections: Array<any>) => {
        const user = await getUserFromSupabaseId(userSupabaseId);
        const diagram = await prisma.diagram.findUnique({
            where: {
                id: diagramId,
                userId: user.id,
            }
        });

        if (!diagram) {
            throw new Error("Diagram not found");
        }

        const updatedDiagram = await prisma.diagram.update({
            where: {
                id: diagramId,
                userId: user.id
            },
            data: {
                elements: updatedElements || [],
                connections: updatedConnections  || [],
            }
        });

        return updatedDiagram;
    };

};

export default DiagramService;