import express from "express";
import { inviteController } from "../controllers/inviteController.js";

const router = express.Router();
export default router;

router.post("/userInvite", inviteController.inviteUser);
router.get("/communityInvites", inviteController.loadCommunityInvites);
router.get("/userInvites", inviteController.loadUserInvites);
router.delete("/inviteAction", inviteController.inviteAction);
