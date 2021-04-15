import express from "express";
import { messageController } from "../controllers/messageController.js";

const router = express.Router();
export default router;

router.get("/getMessages", messageController.getMessages);
router.post("/sendMessage", messageController.sendMessage);