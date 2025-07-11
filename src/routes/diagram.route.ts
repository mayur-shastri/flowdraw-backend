import {Router} from 'express';
import DiagramController from '../controllers/diagram.controller';
import authMiddleware from '../middleware.ts/auth.middleware';
const router = Router();

router.post('/create', authMiddleware ,DiagramController.create);
router.get('/get/:id', authMiddleware, DiagramController.getDiagram);
// route to get basic data of a users diagrams
router.get('/get-diagrams', authMiddleware, DiagramController.getUserDiagrams);
// route to get basic data of diagrams where the user is a collaborator
router.get('/get-collaborations', authMiddleware, DiagramController.getUserCollaborations);
// route to get basic data of diagrams where the user has view-only access
router.get('/get-viewonly-diagrams', authMiddleware, DiagramController.getUserViewOnlyDiagrams);

export default router;