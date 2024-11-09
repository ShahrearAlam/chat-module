import express from "express"
import protect from "../middlewares/authMiddleware.js";
import { accessChat, addToGroup, createGroupChat, fetchChats, removeFromGroup, renameGroup, deleteChat } from "../controllers/chatControllers.js";
const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/group-remove", protect, removeFromGroup);
router.put("/group-add", protect, addToGroup);
router.post("/delete-chat", protect, deleteChat);

export default router