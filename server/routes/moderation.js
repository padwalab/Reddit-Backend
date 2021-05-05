import express from 'express';
import { commModerationController } from '../controllers/moderationController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.get('/', auth, commModerationController.getListOfCommunities);
router.post('/', auth, commModerationController.acceptJoinReqs);
