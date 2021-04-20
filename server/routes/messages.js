import express from "express";
import { messageController } from "../controllers/messageController.js";
import { auth } from "../config/auth.js";

const router = express.Router();
export default router;

router.get("/getMessages", auth, messageController.getMessages);
router.post("/sendMessage", auth, messageController.sendMessage);
