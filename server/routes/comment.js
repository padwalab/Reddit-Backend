import express from 'express';
import { commentController } from '../controllers/commentController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.post('/', auth, commentController.addComment);
router.delete('/', auth, commentController.deleteComment);
router.get('/', auth, commentController.getComments);
