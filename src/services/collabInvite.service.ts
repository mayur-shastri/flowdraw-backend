import { getUserFromSupabaseId } from "../utils/getUserFromSupabaseId";
import prisma from "../utils/prismaClient"

class CollabInviteService {
    static checkIfRequestedByOwner = async (inviterSupabaseId: string, diagramId: string) => {
        if (!diagramId || !inviterSupabaseId) {
            throw new Error("Diagram ID or Inviter ID is invalid");
        }

        const diagram = await prisma.diagram.findUnique({
            where: {
                id: diagramId
            }
        });

        const user = await getUserFromSupabaseId(inviterSupabaseId);

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
        email: string,
        access: string) => {
        if (!inviterId || !diagramId || !email || !access) {
            throw new Error("Could not send the invite");
        }

        if (access !== "VIEW" && access != "EDIT") {
            throw new Error("Invalid level of access provided");
        }

        const invitee = await prisma.user.findUnique({
            where: {
                email: email.toString().trim()
            }
        });

        if (!invitee) {
            throw new Error("User not found");
        }

        const inviter = await getUserFromSupabaseId(inviterId);

        const existingInvite = await prisma.collabInvitation.findFirst({
            where: {
                ownerId: inviter.id,
                diagramId,
                userId: invitee.id,
                accessLevel: access === 'VIEW' ? "VIEW" : "EDIT"
            }
        });

        const existingInviteDate = existingInvite?.createdAt;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (existingInvite &&
            existingInviteDate &&
            new Date(existingInviteDate).getTime() + sevenDays > Date.now() &&
            existingInvite.status === "PENDING") {
            throw new Error("An invite has already been sent");
        }

        const now = new Date();

        const invite = prisma.collabInvitation.create({
            data: {
                ownerId: inviter.id,
                diagramId,
                userId: invitee.id,
                createdAt: now,
                accessLevel: access === 'VIEW' ? "VIEW" : "EDIT"
            }
        });

        return invite;

    };

    static getAllUserInvitations = async (userSupabaseId: string) => {

        const user = await getUserFromSupabaseId(userSupabaseId);

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
            }
        });

        // Map ownerId and diagramId to their info
        const ownerMap = new Map(owners.map(owner => [owner.id, { name: owner.name, email: owner.email }]));
        const diagramMap = new Map(diagrams.map(diagram => [
            diagram.id,
            {
                id: diagram.id,
                title: diagram.title,
                collaboratorsCount: diagram.collaborators.length
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

    static getUserInvitationsByStatus = async (userSupabaseId: string, status: string) => {

        const user = await getUserFromSupabaseId(userSupabaseId);

        // Fetch invitations with only ids and relevant fields
        const invitations = await prisma.collabInvitation.findMany({
            where: {
                userId: user.id,
                status: status === 'PENDING' ? 'PENDING' : (status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED')
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
            }
        });

        // Map ownerId and diagramId to their info
        const ownerMap = new Map(owners.map(owner => [owner.id, { name: owner.name, email: owner.email }]));
        const diagramMap = new Map(diagrams.map(diagram => [
            diagram.id,
            {
                id: diagram.id,
                title: diagram.title,
                collaboratorsCount: diagram.collaborators.length
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

    static countByStatus = async (userId: string, status: string) => {
        return await prisma.collabInvitation.count({
            where: {
                userId: userId,
                status: status === 'PENDING' ? 'PENDING' : (status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED')
            }
        });
    };

    static getUserInvitationsCount = async (userSupabaseId: string) => {
        const user = await getUserFromSupabaseId(userSupabaseId);
        const countAll = await prisma.collabInvitation.count({
            where: {
                userId: user.id
            }
        });

        const countPending = await this.countByStatus(user.id, "PENDING");
        const countAccepted = await this.countByStatus(user.id, "ACCEPTED");
        const countRejected = await this.countByStatus(user.id, "REJECTED");

        return { countAll, countPending, countAccepted, countRejected };
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
            await prisma.collaboration.create({
                data: {
                    userId: user.id,
                    diagramId: invitation.diagramId,
                    accessLevel: invitation.accessLevel
                }
            });

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    collaborations : {
                        create: {
                            diagramId: invitation.diagramId,
                            accessLevel: invitation.accessLevel
                        }
                    }
                }
            });

        }

        return updatedInvitation;
    };

}

export default CollabInviteService;