import express from "express";
import {
    createConversation,
    getCoversations,
    markConversationRead,
    getMessages
} from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddlleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getCoversations);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/read", markConversationRead);

export default router;
