import express from "express";
import { userController } from "../controllers/userController.js";
import {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
} from "../config/validator.js";
import { auth } from "../config/auth.js";
import { upload } from "../config/multer.js";

const router = express.Router();
export default router;

router.get("/test", userController.test);
router.post("/register", userController.register);
router.post("/login", loginValidation, userController.login);
router.get("/login", auth, userController.loadUser);
router.put(
  "/me",
  [auth, upload.single("selectedFile"), profileUpdateValidation],
  userController.updateProfile
);
router.get("/:user_id", userController.getProfileByUserId);
