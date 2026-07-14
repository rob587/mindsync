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

  const energy = Math.min(
    Math.round(blinkRate * 0.3 + Math.abs(headPosition.x) * 30),
    100,
  );

  const valence = Math.min(Math.round((100 - stress) * 0.6 + focus * 0.4), 100);

  let mood = "neutrale";
  if (stress > 70 && focus < 40) mood = "stressato";
  else if (stress < 30 && focus > 70) mood = "rilassato e concentrato";
  else if (energy > 70 && valence > 60) mood = "entusiasta";
  else if (energy < 30 && valence < 40) mood = "stanco";
  else if (focus > 70) mood = "concentrato";
  else if (stress > 60) mood = "teso";

  return {
    stress,
    focus,
    energy,
    valence,
    mood,
    raw: metrics,
  };
}
