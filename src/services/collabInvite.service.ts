import prisma from "../utils/prismaClient"

class CollabInviteService {
    static checkIfRequestedByOwner = async (inviterId: string, diagramId: string) => {
        if (!diagramId || !inviterId) {
            throw new Error("Diagram ID or Inviter ID is invalid");
        }

        const diagram = await prisma.diagram.findUnique({
            where: {
                id: diagramId
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: inviterId
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (!diagram) {
            throw new Error("Diagram not found");
        }

        if (user.id !== diagram.userId) {
            return false;
        }

        return true;

    };

    static createInvite = async (
        inviterId: string,
        diagramId: string,
        inviteeId: string,
        access: string) => {
        if (!inviterId || !diagramId || !inviteeId || !access) {
            throw new Error("Could not send the invite");
        }

        if (access !== "VIEW" && access != "EDIT") {
            throw new Error("Invalid level of access provided");
        }

        const inviter = await prisma.user.findUnique({
            where: {
                supabaseId: inviterId
            }
        });

        if (!inviter) {
            throw new Error("Inviter not found");
        }

        const now = new Date();

        const invite = prisma.collabInvitation.create({
            data: {
                ownerId: inviter.id,
                diagramId,
                userId: inviteeId,
                createdAt: now,
                accessLevel: access === 'VIEW' ? "VIEW" : "EDIT"
            }
        });

        return invite;

    };

    static getInvitations = async (userSupabaseId: string) => {

        if (!userSupabaseId) {
            throw new Error("Invalid User ID");
        }

        const user = await prisma.user.findUnique({
            where: {
                supabaseId: userSupabaseId
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Fetch invitations with only ids and relevant fields
        const invitations = await prisma.collabInvitation.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                ownerId: true,
                diagramId: true,
                createdAt: true,
                accessLevel: true,
                status: true
            }
        });

        // Fetch all unique ownerIds and diagramIds
        const ownerIds = [...new Set(invitations.map(invite => invite.ownerId))];
        const diagramIds = [...new Set(invitations.map(invite => invite.diagramId))];

        // Fetch all owners in one query
        const owners = await prisma.user.findMany({
            where: {
                id: { in: ownerIds }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        // Fetch all diagrams in one query
        const diagrams = await prisma.diagram.findMany({
            where: {
                id: { in: diagramIds }
            },
            select: {
                id: true,
                title: true,
                collaborators: { select: { userId: true } },
                viewOnlyCollaborators: { select: { userId: true } }
            }
        });

        // Map ownerId and diagramId to their info
        const ownerMap = new Map(owners.map(owner => [owner.id, { name: owner.name, email: owner.email }]));
        const diagramMap = new Map(diagrams.map(diagram => [
            diagram.id,
            {
                id: diagram.id,
                title: diagram.title,
                collaboratorsCount: diagram.collaborators.length + diagram.viewOnlyCollaborators.length
            }
        ]));

        // Map to summary format
        return invitations.map(invite => {
            const diagram = diagramMap.get(invite.diagramId) || { id: null, title: null, collaboratorsCount: 0 };
            return {
                id: invite.id,
                inviter: ownerMap.get(invite.ownerId) || { name: null, email: null },
                diagram: {
                    id: diagram.id,
                    title: diagram.title
                },
                collaborators: diagram.collaboratorsCount,
                invitedAt: invite.createdAt.toISOString(),
                expiresAt: null, // Not present in schema
                accessLevel: invite.accessLevel,
                status: invite.status
            };
        });
    };

    static updateInvitationStatus = async (userSupabaseId: string, invitationId: string, accept: boolean) => {
        if (!userSupabaseId || !invitationId) {
            throw new Error("Invalid User ID or Invitation ID");
        }

        const user = await prisma.user.findUnique({
            where: {
                supabaseId: userSupabaseId
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const invitation = await prisma.collabInvitation.findUnique({
            where: {
                id: invitationId
            }
        });

        if (!invitation) {
            throw new Error("Invitation not found");
        }

        if (invitation.userId !== user.id) {
            throw new Error("You are not authorized to accept this invitation");
        }

        const updatedInvitation = await prisma.collabInvitation.update({
            where: {
                id: invitationId
            },
            data: {
                status: accept ? "ACCEPTED" : "REJECTED",
            }
        });

        if (accept) {
            if (invitation.accessLevel === "EDIT") {
                await prisma.collaboration.create({
                    data: {
                        userId: user.id,
                        diagramId: invitation.diagramId,
                    }
                });
            } else if (invitation.accessLevel === "VIEW") {
                await prisma.viewOnlyCollaboration.create({
                    data: {
                        userId: user.id,
                        diagramId: invitation.diagramId,
                    }
                });
            }
        }

        return updatedInvitation;

    };

}

export default CollabInviteService;