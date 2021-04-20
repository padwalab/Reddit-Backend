import express from "express";
import { inviteController } from "../controllers/inviteController.js";
import { auth } from '../config/auth.js';

const router = express.Router();
export default router;

router.post("/userInvite", auth, inviteController.inviteUser);
router.get("/communityInvites", auth, inviteController.loadCommunityInvites);
router.get("/userInvites", auth, inviteController.loadUserInvites);
router.delete("/inviteAction", auth, inviteController.inviteAction);
