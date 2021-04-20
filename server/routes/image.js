import express from 'express';
import { imageController } from '../controllers/imageController.js';

const router = express.Router();
export default router;

router.get('/:imageId', imageController.getSingleImage);
