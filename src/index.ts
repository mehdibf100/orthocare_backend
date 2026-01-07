import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";

import authRouter from "./controllers/authController";
import chatRouter from "./controllers/chatController";
import checkListRouter from "./controllers/checkListController";
import { initializeWebSocket } from "./websocket/chatSocket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

initializeWebSocket(httpServer);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/checklist", checkListRouter);

app.get("/health", (_req: Request, res: Response) =>
  res.json({ ok: true })
);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
