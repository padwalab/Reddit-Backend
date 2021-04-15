import express from 'express';
import { userController } from '../controllers/userController.js';
import {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
} from '../config/validator.js';
import { auth } from '../config/auth.js';
import { uploadSingle } from '../config/multer.js';

const router = express.Router();
export default router;

router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.get('/login', auth, userController.loadUser);
router.put(
  '/me',
  [auth, uploadSingle.single('selectedFile'), profileUpdateValidation],
  userController.updateProfile
);
