import express from 'express';
import { messageController } from '../controllers/messageController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.post('/', auth, messageController.sendMessage);
router.get('/', auth, messageController.getMessages);
router.get('/find', auth, messageController.findUser);
