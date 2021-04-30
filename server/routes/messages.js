import express from 'express';
import { messageController } from '../controllers/messageController.js';
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.get('/getMessages', auth, messageController.getConversation);
router.post('/', auth, messageController.sendMessage);
router.get('/', auth, messageController.userMessages);
