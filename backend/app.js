import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "MindSync is alive!" });
});

export default app;

// ricordare di importare routes
