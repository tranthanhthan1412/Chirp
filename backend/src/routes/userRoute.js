import express from "express";
import { authMe, searchUsers, updateProfile, uploadAvatar } from "../controllers/userController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get('/me', authMe);

router.get('/search', searchUsers);
router.patch('/me', updateProfile);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

export default router;
