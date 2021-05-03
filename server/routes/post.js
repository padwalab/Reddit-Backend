import express from 'express';
import { postController } from '../controllers/postController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.post('/', auth, postController.addPost);
router.delete('/', auth, postController.deletePost);
router.post('/vote', auth, postController.addVote);
router.get('/vote', auth, postController.voteCount);