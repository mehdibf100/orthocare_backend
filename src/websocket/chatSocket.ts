// src/websocket/chatSocket.ts
import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import conversationService from "../services/conversation.service";

// ✅ Exporter pour usage dans le controller
export let io: Server;
export const userSockets = new Map<number, string>();

export const initializeWebSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    let currentUserId: number | null = null;

    console.log(`Socket connected: ${socket.id}`);

    socket.on("identify", (data: { userId: number }) => {
      currentUserId = data.userId;
      userSockets.set(currentUserId, socket.id);
      console.log(`User ${currentUserId} identified with socket ${socket.id}`);
    });

    socket.on("join_conversation", (data: { conversationId: number; userId: number }) => {
      const room = `conversation_${data.conversationId}`;
      socket.join(room);
      currentUserId = data.userId;
      userSockets.set(currentUserId, socket.id);
      console.log(`User ${data.userId} joined ${room}`);
    });

    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on("send_message", async (data: {
      conversationId: number;
      content: string;
      userId: number;
    }) => {
      try {
        const message = await conversationService.sendMessage(data.userId, {
          conversationId: data.conversationId,
          content: data.content,
        });

        io.to(`conversation_${data.conversationId}`).emit("new_message", message);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Erreur lors de l'envoi du message" });
      }
    });

    socket.on("typing", (data: { conversationId: number; userId: number }) => {
      socket.to(`conversation_${data.conversationId}`).emit("user_typing", data);
    });

    socket.on("stop_typing", (data: { conversationId: number; userId: number }) => {
      socket.to(`conversation_${data.conversationId}`).emit("user_stop_typing", data);
    });

    socket.on("mark_as_read", async (data: { conversationId: number; userId: number }) => {
      try {
        await conversationService.markAsRead(data.conversationId, data.userId);
        socket.to(`conversation_${data.conversationId}`).emit("messages_read", data);
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    });

    socket.on("disconnect", () => {
      if (currentUserId) {
        userSockets.delete(currentUserId);
        console.log(`User ${currentUserId} disconnected`);
      }
    });
  });

  return io;
};