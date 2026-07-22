import express from "express";
import {
  analyzeEmotion,
  getHistory,
  chat,
  getSession,
} from "../controllers/emotionController.js";

const router = express.Router();

router.post("/analyze", analyzeEmotion);

router.post("/chat", chat);

router.get("/session/:id", getSession);

router.get("/history/:userId", getHistory);

export default router;
