import express from 'express';
import { communityHomeController } from '../controllers/communityHomeController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.post('/join-community', auth, communityHomeController.requestToJOin);
router.get('/:communityId', communityHomeController.getCommunityInfo);
router.delete('/', auth, communityHomeController.leaveCommunity);
