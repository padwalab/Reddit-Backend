import express from 'express';
import { communitySearchController } from '../controllers/communitySearchController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;
router.get('/:filter', auth, communitySearchController.searchCommunity);