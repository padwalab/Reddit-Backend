import express from 'express';
import { postController } from '../controllers/postController.js';
import { auth } from '../config/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();
export default router;

router.post('/', [auth,upload.array('content')], postController.addPost);
router.delete('/', auth, postController.deletePost);
router.post('/vote', auth, postController.addVote);
router.get('/vote', auth, postController.voteCount);