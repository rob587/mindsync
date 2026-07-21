import express from "express";
import {
  analyzeEmotion,
  getHistory,
  chat,
} from "../controllers/emotionController.js";

const router = express.Router();

router.post("/analyze", analyzeEmotion);

router.post("/chat", chat);

router.get("/history/:userId", getHistory);

export default router;
