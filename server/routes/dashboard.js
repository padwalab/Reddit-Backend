import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.get('/', auth, dashboardController.getAllPosts);
