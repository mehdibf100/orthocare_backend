export interface CreateConversationDTO {
  participantIds: number[];
}

export interface SendMessageDTO {
  conversationId: number;
  content: string;
}

export interface UserDTO {
  id: number;
  name: string | null;
  email: string;
  imageUrl: string | null;
}

export interface MessageDTO {
  id: number;
  content: string;
  conversationId: number;
  senderId: number;
  sender: UserDTO;
  createdAt: Date;
}

export interface ConversationDTO {
  id: number;
  participants: UserDTO[];
  lastMessage: MessageDTO | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token requis" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: number;
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token invalide" });
  }
};