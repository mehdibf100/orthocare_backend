import { PrismaClient } from "@prisma/client";
import {
  CreateConversationDTO,
  SendMessageDTO,
  ConversationDTO,
  MessageDTO,
} from "../types/chat.types";

const prisma = new PrismaClient();

export class ConversationService {
  async findOrCreateConversation(
    userId: number,
    otherUserId: number
  ): Promise<ConversationDTO> {
    // Chercher une conversation existante entre ces deux utilisateurs
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: userId },
            },
          },
          {
            participants: {
              some: { userId: otherUserId },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return this.mapToConversationDTO(existingConversation, userId);
    }

    // Créer une nouvelle conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        messages: true,
      },
    });

    return this.mapToConversationDTO(newConversation, userId);
  }

  async getUserConversations(userId: number): Promise<ConversationDTO[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return conversations.map((conv :any) => this.mapToConversationDTO(conv, userId));
  }

  async getConversationMessages(
    conversationId: number,
    userId: number,
    limit = 50,
    offset = 0
  ): Promise<MessageDTO[]> {
    // Vérifier que l'utilisateur fait partie de la conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new Error("Accès non autorisé à cette conversation");
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      skip: offset,
      take: limit,
    });

    return messages;
  }

  async sendMessage(
    userId: number,
    data: SendMessageDTO
  ): Promise<MessageDTO> {
    // Vérifier que l'utilisateur fait partie de la conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: data.conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new Error("Accès non autorisé à cette conversation");
    }

    const message = await prisma.message.create({
      data: {
        content: data.content,
        conversationId: data.conversationId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(conversationId: number, userId: number): Promise<void> {
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastRead: new Date(),
      },
    });
  }

  private mapToConversationDTO(conversation: any, userId: number): ConversationDTO {
    const participants = conversation.participants.map((p: any) => p.user);
    const lastMessage = conversation.messages[0] || null;
    
    // Compter les messages non lus
    const participant = conversation.participants.find(
      (p: any) => p.userId === userId
    );
    const lastRead = participant?.lastRead || new Date(0);
    const unreadCount = conversation.messages.filter(
      (m: any) => m.createdAt > lastRead && m.senderId !== userId
    ).length;

    return {
      id: conversation.id,
      participants,
      lastMessage,
      unreadCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}

export default new ConversationService();