import express from 'express';
import { communityAnalyticsController } from '../controllers/communityAnalyticsController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.get('/', auth, communityAnalyticsController.analytics);