import {Router} from "express";
import authMiddleware from "../middleware.ts/auth.middleware";
import CollabInviteController from "../controllers/collabInvite.controller";

const router = Router();

router.post('/invite', authMiddleware, CollabInviteController.createInvite);
router.get('/user-invitations', authMiddleware, CollabInviteController.getUserInvitations);
router.patch('/update-invitation-status', authMiddleware, CollabInviteController.updateInvitationStatus);
export default router;