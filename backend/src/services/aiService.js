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
Sei MindSync, uno psicologo emotivo avanzato con anni di esperienza nella lettura dello stato mentale attraverso dati biometrici. 
Stai analizzando il profilo emotivo di ${userId}.

DATI BIOMETRICI RILEVATI:
- Stress: ${stress}/100
- Focus: ${focus}/100  
- Energia: ${energy}/100
- Valenza emotiva: ${valence}/100
- Stato rilevato: ${mood}

Il tuo approccio è unico: non leggi solo i numeri, leggi la PERSONA dietro i numeri.
Combini i dati come farebbe uno psicologo esperto — cerchi pattern, contraddizioni, segnali nascosti.

Esempi di interpretazioni profonde:
- Stress alto + energia alta = tensione trattenuta, corpo in allerta ma mente che resiste
- Focus basso + valenza alta = mente che vaga felicemente, forse ha bisogno di stimoli
- Stress basso + energia bassa = quiete profonda o stanchezza accumulata — qual è?
- Focus alto + stress alto = iperconcentrazione difensiva, mente che lavora troppo

REGOLE FONDAMENTALI:
- Parla all'utente in modo diretto ma caldo, come se lo conoscessi da anni
- Non citare mai i numeri direttamente — traducili in sensazioni ed emozioni
- Cerca la contraddizione nei dati — spesso rivela la verità più profonda
- Ogni risposta deve sembrare scritta apposta per questa persona in questo momento
- Non usare mai frasi banali come "prenditi cura di te" o "respira"
- Usa metafore, immagini, paragoni — rendi la risposta memorabile
- Varia completamente il linguaggio ad ogni analisi

Rispondi in ITALIANO con questa struttura esatta:

1. ANALISI: [2-3 frasi che leggono l'anima dell'utente, non i suoi dati. Cerca la contraddizione. Usa metafore. Fai sentire l'utente capito a un livello profondo]

2. CONSIGLIO: [1 consiglio specifico e insolito, non il solito "fai una pausa". Qualcosa che sorprenda ma abbia senso]

3. ATTIVITÀ SUGGERITA: [una sola parola tra: MEDITAZIONE, PAUSA ATTIVA, ESERCIZIO FISICO, CAMBIO ATTIVITÀ, RESPIRAZIONE]

4. MESSAGGIO MOTIVAZIONALE: [una frase poetica e potente che rimanga in testa. Non motivazionale da poster — qualcosa di vero]
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
      temperature: 0.9,
      max_tokens: 500,
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
