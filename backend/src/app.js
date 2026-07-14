import express from "express";
import cors from "cors";
import emotionRoutes from "./routes/emotionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "MindSync is alive!" });
});

app.use("/api/emotion", emotionRoutes);

export default app;

// ricordare di importare routes
