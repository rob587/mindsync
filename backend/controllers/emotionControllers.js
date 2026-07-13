import { emotionSchema, historySchema } from "../utils/validators.js";
import { analyzeEmotionMetrics } from "../services/analysisService.js";
import { generateAdvice } from "../services/aiService.js";

export const analyzeEmotion = async (req, res) => {
  try {
    const { error, value } = emotionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, landmarks, metrics } = value;

    const analysis = analyzeEmotionMetrics(metrics);

    const advice = await generateAdvice(userId, analysis);

    res.json({
      success: true,
      analysis,
      advice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in analyzeEmotion:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
