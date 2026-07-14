import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAdvice(userId, analysis) {
  const { stress, focus, energy, valence, mood } = analysis;

  // Costruiamo il prompt per Groq
  const prompt = `
Sei MindSync, un coach emotivo avanzato con un approccio caldo e umano.
Stai parlando con Roberto (o con l'utente che si chiama ${userId}).

Ecco i dati biometrici attuali:
- Stress: ${stress}/100
- Focus: ${focus}/100
- Energia: ${energy}/100
- Stato emotivo: ${mood}

Rispondi in ITALIANO con questa struttura esatta:

1. ANALISI: [descrivi il suo stato emotivo in modo empatico e umano, usando il suo nome, 2-3 frasi]
2. CONSIGLIO: [un consiglio pratico e specifico per migliorare il suo stato, 1-2 frasi]
3. ATTIVITÀ SUGGERITA: [una sola parola tra queste: MEDITAZIONE, PAUSA ATTIVA, ESERCIZIO FISICO, CAMBIO ATTIVITÀ, RESPIRAZIONE]
4. MESSAGGIO MOTIVAZIONALE: [una frase breve che lo spinga a fare questa attività]

Sii caloroso, usa un tono da amico che capisce le emozioni, mai giudicante.
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Sei un coach emotivo empatico. Rispondi sempre in italiano, con calore e umanità.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || "";

    const parsedAdvice = parseAdviceResponse(content);

    return parsedAdvice;
  } catch (error) {
    console.error("Groq API error:", error);
    return {
      analysis: "Stai affrontando la giornata con determinazione.",
      advice: "Fai una breve pausa di 5 minuti per respirare profondamente.",
      suggestedActivity: "RESPIRAZIONE",
      motivation: "Un momento di calma può fare la differenza.",
    };
  }
}

function parseAdviceResponse(content) {
  const lines = content.split("\n").filter((line) => line.trim());
  let result = {
    analysis: "Stai vivendo un momento di introspezione.",
    advice: "Prenditi un momento per ascoltare il tuo respiro.",
    suggestedActivity: "RESPIRAZIONE",
    motivation:
      "Ogni passo verso la consapevolezza è un passo verso il benessere.",
  };

  for (const line of lines) {
    if (line.toLowerCase().includes("analisi") || line.match(/^1\./)) {
      result.analysis = line.replace(/^.*?[:：]/, "").trim();
    } else if (line.toLowerCase().includes("consiglio") || line.match(/^2\./)) {
      result.advice = line.replace(/^.*?[:：]/, "").trim();
    } else if (line.toLowerCase().includes("attività") || line.match(/^3\./)) {
      const activity = line
        .replace(/^.*?[:：]/, "")
        .trim()
        .toUpperCase();
      const validActivities = [
        "MEDITAZIONE",
        "PAUSA ATTIVA",
        "ESERCIZIO FISICO",
        "CAMBIO ATTIVITÀ",
        "RESPIRAZIONE",
      ];
      if (validActivities.includes(activity)) {
        result.suggestedActivity = activity;
      }
    } else if (
      line.toLowerCase().includes("motivazionale") ||
      line.match(/^4\./)
    ) {
      result.motivation = line.replace(/^.*?[:：]/, "").trim();
    }
  }

  return result;
}
