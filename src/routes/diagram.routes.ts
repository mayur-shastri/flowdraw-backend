import {Router} from 'express';
import DiagramController from '../controllers/diagram.controller';
import authMiddleware from '../middleware.ts/auth.middleware';
const router = Router();

router.post('/create', authMiddleware ,DiagramController.create);
router.patch('metadata/:id', authMiddleware ,DiagramController.updateMetadata);
router.patch('/elements/:id', authMiddleware ,DiagramController.updateElements);

export default router;