import express from 'express';
import { communityController } from '../controllers/communityController.js';
import { communityValidation } from '../config/validator.js';
import { auth } from '../config/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();
export default router;

router.post(
  '/create',
  [auth, upload.single('communityProfilePic'), communityValidation],
  communityController.create
);
router.put(
  '/:community_id',
  [auth, upload.single('communityProfilePic')],
  communityController.updateCommunity
);
router.get('/', auth, communityController.getAllMyCommunities);
