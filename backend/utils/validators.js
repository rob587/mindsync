import Joi from "joi";

export const emotionSchema = Joi.object({
  userId: Joi.string().required(),
  landmarks: Joi.array().items(Joi.array().items(Joi.number())).required(),
  metrics: Joi.object({
    eyeOpenness: Joi.number().min(0).max(100),
    mouthTension: Joi.number().min(0).max(100),
    blinkRate: Joi.number().min(0),
    headPosition: Joi.object({
      x: Joi.number(),
      y: Joi.number(),
      z: Joi.number(),
    }),
  }).required(),
});
