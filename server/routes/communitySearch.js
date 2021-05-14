import express from 'express';
import { communitySearchController } from '../controllers/communitySearchController.js';

const router = express.Router();
export default router;
router.get('/:filter?', communitySearchController.searchCommunity);