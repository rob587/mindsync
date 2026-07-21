import pool from "../db.js";
import { emotionSchema } from "../utils/validators.js";
import { analyzeEmotionMetrics } from "../services/analysisService.js";
import { generateAdvice } from "../services/aiService.js";

import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyzeEmotion = async (req, res) => {
  try {
    console.log(" Ricevuta richiesta analyzeEmotion");
    console.log(" Body:", JSON.stringify(req.body, null, 2));

    // 1. Validazione input
    const { error, value } = emotionSchema.validate(req.body);
    if (error) {
      console.log("❌ Errore validazione:", error.details[0].message);
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { userId, landmarks, metrics, sessionId } = value;

    console.log(`Utente: ${userId}`);
    console.log(`Metriche ricevute:`, metrics);

    // 2. Analisi metriche
    const analysis = analyzeEmotionMetrics(metrics);
    console.log(`Analisi completata:`, analysis);

    // 3. Genera consiglio con Groq
    console.log("Chiamata a Groq in corso...");
    const advice = await generateAdvice(userId, analysis);
    console.log("Consiglio ricevuto:", advice);

    // 4. CERCA O CREA UTENTE
    console.log("Cerco utente nel DB...");
    let userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $1",
      [userId],
    );

    let user_id;
    if (userResult.rows.length === 0) {
      console.log("Utente non trovato, lo creo...");
      const newUser = await pool.query(
        `INSERT INTO users (username, email) 
                 VALUES ($1, $2) 
                 RETURNING id`,
        [userId, `${userId}@mindsync.local`],
      );
      user_id = newUser.rows[0].id;
      console.log(`Utente creato con ID: ${user_id}`);
    } else {
      user_id = userResult.rows[0].id;
      console.log(`Utente trovato con ID: ${user_id}`);
    }

    // 5. SALVA STATO EMOTIVO
    console.log("💾 Salvo stato emotivo nel DB...");
    const stateResult = await pool.query(
      `INSERT INTO emotion_states (
                user_id, stress, focus, energy, valence, mood, 
                raw_data, advice_given, session_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, created_at`,
      [
        user_id,
        analysis.stress,
        analysis.focus,
        analysis.energy,
        analysis.valence,
        analysis.mood,
        JSON.stringify({ landmarks, metrics }),
        JSON.stringify(advice),
        sessionId || `session_${Date.now()}`,
      ],
    );
    console.log(`✅ Stato salvato con ID: ${stateResult.rows[0].id}`);

    // 6. SALVA ATTIVITÀ SUGGERITA (se presente)
    if (advice.suggestedActivity) {
      console.log(`Salvo attività suggerita: ${advice.suggestedActivity}`);
      await pool.query(
        `INSERT INTO suggested_activities (
                    user_id, emotion_state_id, activity_type, description
                ) VALUES ($1, $2, $3, $4)`,
        [
          user_id,
          stateResult.rows[0].id,
          advice.suggestedActivity,
          advice.advice || advice.motivation || "Attività consigliata",
        ],
      );
    }

    // 7. RECUPERA STORICO
    console.log("Recupero storico utente...");
    const historyResult = await pool.query(
      `SELECT 
                es.mood, es.stress, es.focus, es.energy, es.created_at,
                sa.activity_type as suggested_activity,
                sa.completed as activity_completed
             FROM emotion_states es
             LEFT JOIN suggested_activities sa ON es.id = sa.emotion_state_id
             WHERE es.user_id = $1
             ORDER BY es.created_at DESC
             LIMIT 7`,
      [user_id],
    );
    console.log(`Trovati ${historyResult.rows.length} record storici`);

    // 8. Rispondi
    res.json({
      success: true,
      analysis: {
        ...analysis,
        id: stateResult.rows[0].id,
        saved_at: stateResult.rows[0].created_at,
      },
      advice,
      history: historyResult.rows,
      timestamp: new Date().toISOString(),
    });

    console.log("Risposta inviata con successo");
  } catch (error) {
    console.error("ERRORE in analyzeEmotion:", error);
    console.error("📚 Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 7;

    console.log(`📜 Recupero storico per utente: ${userId}`);

    const result = await pool.query(
      `SELECT 
                es.id,
                es.stress,
                es.focus,
                es.energy,
                es.valence,
                es.mood,
                es.created_at,
                es.advice_given,
                sa.activity_type as suggested_activity,
                sa.completed as activity_completed,
                sa.id as activity_id
             FROM emotion_states es
             LEFT JOIN suggested_activities sa ON es.id = sa.emotion_state_id
             INNER JOIN users u ON es.user_id = u.id
             WHERE u.username = $1 OR u.email = $1
             ORDER BY es.created_at DESC
             LIMIT $2`,
      [userId, limit],
    );

    const statsResult = await pool.query(
      `SELECT 
                COUNT(*) as total_sessions,
                ROUND(AVG(stress)) as avg_stress,
                ROUND(AVG(focus)) as avg_focus
             FROM emotion_states es
             INNER JOIN users u ON es.user_id = u.id
             WHERE u.username = $1 OR u.email = $1`,
      [userId],
    );

    res.json({
      success: true,
      history: result.rows,
      stats: statsResult.rows[0] || {},
    });
  } catch (error) {
    console.error("❌ ERRORE in getHistory:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

export const chat = async (req, res) => {
  try {
    const { message, analysis, advice, history } = req.body;

    const { stress, focus, energy, valence, mood } = analysis;

    const conversationHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    const systemPrompt = `
Sei MindSync, uno psicologo emotivo AI empatico e profondo.
Stai parlando con l'utente dopo aver analizzato il suo stato emotivo.

DATI BIOMETRICI DELL'UTENTE:
- Stress: ${stress}/100
- Focus: ${focus}/100
- Energia: ${energy}/100
- Valenza: ${valence}/100
- Umore: ${mood}

ANALISI CHE HAI GIÀ FATTO:
${advice.analysis}

CONSIGLIO CHE HAI GIÀ DATO:
${advice.advice}

ATTIVITÀ SUGGERITA: ${advice.suggestedActivity}

REGOLE:
- Rispondi sempre in italiano
- Sei empatico, profondo, mai banale
- Conosci già i dati biometrici — usali per personalizzare le risposte
- Se l'utente chiede spiegazioni sui dati, traducili in sensazioni ed emozioni
- Non ripetere l'analisi iniziale — approfondisci, esplora, dialoga
- Fai domande quando ha senso per capire meglio l'utente
- Max 3-4 frasi per risposta — conversazione fluida, non monologhi
- Sii come un amico psicologo che conosce l'utente a fondo
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: 0.85,
      max_tokens: 300,
    });

    const reply =
      response.choices[0]?.message?.content || "Non ho capito, puoi ripetere?";

    res.json({ success: true, reply });
  } catch (error) {
    console.error("ERRORE CHAT:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
