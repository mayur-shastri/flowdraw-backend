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

        if (!diagram) {
            throw new Error("Diagram not found");
        }

        if (inviterId !== diagram.userId) {
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

        const now = new Date();

        const invite = prisma.collabInvitation.create({
            data: {
                ownerId: inviterId,
                diagramId,
                userId: inviteeId,
                createdAt: now,
                accessLevel: access === 'VIEW' ? "VIEW" : "EDIT"
            }
        });

        return invite;

    };

    static getInvitations = async (id: string) => {

        if (!id) {
            throw new Error("Invalid User ID");
        }

        const invitations = prisma.collabInvitation.findMany({
            where: {
                userId: id
            }
        });

        return invitations;

    };

    static updateInvitationStatus = async (userId : string, invitationId : string, accept: boolean)=>{
        if (!userId || !invitationId) {
            throw new Error("Invalid User ID or Invitation ID");
        }

        const invitation = await prisma.collabInvitation.findUnique({
            where: {
                id: invitationId
            }
        });

        if (!invitation) {
            throw new Error("Invitation not found");
        }

        if (invitation.userId !== userId) {
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

        return updatedInvitation;

    };

}

export default CollabInviteService;