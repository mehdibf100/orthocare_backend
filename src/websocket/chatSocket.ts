// src/websocket/chatSocket.ts
import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import conversationService from "../services/conversation.service";

interface SocketData {
  userId: number;
}

export const initializeWebSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Map pour stocker userId -> socketId
  const userSockets = new Map<number, string>();

  io.on("connection", (socket: Socket) => {
    let currentUserId: number | null = null;

    console.log(`Socket connected: ${socket.id}`);

    // L'utilisateur s'identifie
    socket.on("identify", (data: { userId: number }) => {
      currentUserId = data.userId;
      userSockets.set(currentUserId, socket.id);
      console.log(`User ${currentUserId} identified with socket ${socket.id}`);
    });

    // Rejoindre une conversation
    socket.on("join_conversation", (data: { conversationId: number; userId: number }) => {
      const room = `conversation_${data.conversationId}`;
      socket.join(room);
      currentUserId = data.userId;
      userSockets.set(currentUserId, socket.id);
      console.log(`User ${data.userId} joined ${room}`);
    });

    // Quitter une conversation
    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User left conversation ${conversationId}`);
    });

    // Envoyer un message
    socket.on("send_message", async (data: {
      conversationId: number;
      content: string;
      userId: number;
    }) => {
      try {
        console.log("Received send_message:", data);

        const message = await conversationService.sendMessage(data.userId, {
          conversationId: data.conversationId,
          content: data.content,
        });

        console.log("Message created:", message);

        // Émettre à tous les participants de la conversation
        io.to(`conversation_${data.conversationId}`).emit("new_message", message);
        
        console.log(`Message emitted to conversation_${data.conversationId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Erreur lors de l'envoi du message" });
      }
    });

    // L'utilisateur est en train de taper
    socket.on("typing", (data: { conversationId: number; userId: number }) => {
      socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    // L'utilisateur a arrêté de taper
    socket.on("stop_typing", (data: { conversationId: number; userId: number }) => {
      socket.to(`conversation_${data.conversationId}`).emit("user_stop_typing", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    // Marquer comme lu
    socket.on("mark_as_read", async (data: { conversationId: number; userId: number }) => {
      try {
        await conversationService.markAsRead(data.conversationId, data.userId);
        socket.to(`conversation_${data.conversationId}`).emit("messages_read", {
          userId: data.userId,
          conversationId: data.conversationId,
        });
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    });

    // Déconnexion
    socket.on("disconnect", () => {
      if (currentUserId) {
        userSockets.delete(currentUserId);
        console.log(`User ${currentUserId} disconnected`);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};