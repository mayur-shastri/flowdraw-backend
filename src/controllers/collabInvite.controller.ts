import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../types";
import { Response } from "express";
import CollabInviteService from "../services/collabInvite.service";

class CollabInviteController{

    static createInvite = expressAsyncHandler(async (req : AuthenticatedRequest, res : Response)=>{
        const inviter = req.user;
        const {diagramId, inviteeId, access} = req.body;
        if(!CollabInviteService.checkIfRequestedByOwner(inviter.id, diagramId)){
            throw new Error("You are not authorized to invite");
        }
        const invitation = CollabInviteService.createInvite(inviter.id, diagramId, inviteeId, access);
        if(!invitation){
            res.status(400).json({message: "Failed to create the invitation"});
            return;
        }
        res.status(201).json({invitation, message: "Invitation Created Successfully"});
    });

    static getUserInvitations = expressAsyncHandler(async (req : AuthenticatedRequest, res : Response)=>{
        const user = req.user;
        if(!user){
            res.status(401).json({message: "You are not logged in"});
            return;
        }
        const invitations = CollabInviteService.getInvitations(user.id);
        if(!invitations){
            res.status(400).json({message: "Failed to fetch the invitations"});
        }
        res.status(200).json({invitations, message: "Invitations fetched successfully"});
    });

    static updateInvitationStatus = expressAsyncHandler(async (req : AuthenticatedRequest, res : Response)=>{
        const user = req.user;
        const { invitationId, accept } = req.body;
        if(!user){
            res.status(401).json({message: "You are not logged in"});
            return;
        }
        const updatedInvitation = CollabInviteService.updateInvitationStatus(user.id, invitationId, accept);
        if(!updatedInvitation){
            res.status(400).json({message: "Failed to accept the invitation"});
            return;
        }
        res.status(200).json({message: "Invitation updated successfully", updatedInvitation});
    });

};

export default CollabInviteController;