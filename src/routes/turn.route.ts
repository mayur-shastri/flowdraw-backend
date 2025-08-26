import {Router} from 'express';
import TurnController from '../controllers/turn.controller';

const router = Router();

router.get('/get-credentials', TurnController.getTurnCredentials);

export default router;