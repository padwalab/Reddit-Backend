import express from 'express';
import { communityHomeController } from '../controllers/communityHomeController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.post('/join-community', auth, communityHomeController.requestToJOin);
