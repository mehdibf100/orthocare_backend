import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";

import authRouter from "./controllers/authController";
import chatRouter from "./controllers/chatController";
import checkListRouter from './controllers/checkListController';
import medicalFormController from './controllers/medicalController';

import { initializeWebSocket } from "./websocket/chatSocket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialiser WebSocket
initializeWebSocket(httpServer);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use('/api/checklist', checkListRouter);
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));
app.use("/medical", medicalFormController);

// ✅ 404 JSON
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route API introuvable",
  });
});

// ✅ error global
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Erreur serveur",
  });
});

export default httpServer;