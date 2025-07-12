import {Router} from "express";
import authMiddleware from "../middleware.ts/auth.middleware";
import CollabInviteController from "../controllers/collabInvite.controller";

const router = Router();

router.post('/invite', authMiddleware, CollabInviteController.createInvite);
router.get('/all-user-invitations', authMiddleware, CollabInviteController.getAllUserInvitations);
router.get('/filter-user-invitations', authMiddleware, CollabInviteController.getUserInvitationsByStatus);
router.get('/count', authMiddleware, CollabInviteController.getUserInvitationsCount);
router.patch('/update-invitation-status', authMiddleware, CollabInviteController.updateInvitationStatus);
export default router;