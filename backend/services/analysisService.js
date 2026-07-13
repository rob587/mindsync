export function analyzeEmotionMetrics(metrics) {
  const { eyeOpenness, mouthTension, blinkRate, headPosition } = metrics;

  const stress = Math.min(
    Math.round(mouthTension * 0.6 + blinkRate * 0.4),
    100,
  );

  const focus = Math.min(
    Math.round(eyeOpenness * 0.7 + (100 - Math.abs(headPosition.y) * 20)),
    100,
  );
}
