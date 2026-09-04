import express from "express";
import {
    createConversation,
    getCoversations,
    getMessages
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddlleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getCoversations);
router.get("/:conversationId/messages", getMessages);

export default router;
