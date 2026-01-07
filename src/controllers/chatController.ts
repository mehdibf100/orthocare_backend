// src/controllers/chatController.ts
import { Router, Request, Response } from "express";
import conversationService from "../services/conversation.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// Obtenir tous les utilisateurs (sauf l'utilisateur courant)
router.get("/users", async (req: Request, res: Response) => {
  try {

    const users = await prisma.user.findMany({

      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir toutes les conversations de l'utilisateur
router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(400).json({ error: "userId est requis" });
    }

    const conversations = await conversationService.getUserConversations(userId);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer ou obtenir une conversation
router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({ error: "userId et otherUserId sont requis" });
    }

    const conversation = await conversationService.findOrCreateConversation(
      userId,
      otherUserId
    );

    res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Obtenir les messages d'une conversation
router.get("/conversations/:conversationId/messages", async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = parseInt(req.query.userId as string);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: "userId est requis" });
    }

    const messages = await conversationService.getConversationMessages(
      conversationId,
      userId,
      limit,
      offset
    );

    res.json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    if (error.message === "Accès non autorisé à cette conversation") {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Envoyer un message (HTTP - backup)
router.post("/messages", async (req: Request, res: Response) => {
  try {
    const { userId, conversationId, content } = req.body;

    if (!userId || !conversationId || !content) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const message = await conversationService.sendMessage(userId, {
      conversationId,
      content,
    });

    res.json(message);
  } catch (error: any) {
    console.error("Error sending message:", error);
    if (error.message === "Accès non autorisé à cette conversation") {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Marquer une conversation comme lue
router.post("/conversations/:conversationId/read", async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId est requis" });
    }

    await conversationService.markAsRead(conversationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;