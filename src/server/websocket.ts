import "dotenv/config";
import { WebSocket, WebSocketServer } from "ws";
import { parse } from "url";
import { prisma } from "../../lib/db";
const port = 3001;
const wss = new WebSocketServer({ port });

// Map of userId -> WebSocket connection
const clients = new Map<string, WebSocket>();

// Map of itineraryId -> Set of userIds currently viewing the chat
const rooms = new Map<string, Set<string>>();

wss.on("connection", (ws, req) => {
  const { query } = parse(req.url || "", true);
  const userId = query.userId as string;
  const itineraryId = query.itineraryId as string;

  if (!userId || !itineraryId) {
    ws.close(1008, "Missing userId or itineraryId");
    return;
  }

  // Register client
  clients.set(userId, ws);

  // Add to room
  if (!rooms.has(itineraryId)) {
    rooms.set(itineraryId, new Set());
  }
  rooms.get(itineraryId)!.add(userId);

  console.log(`User ${userId} joined room ${itineraryId}`);

  ws.on("message", async (data) => {
    try {
      const messageText = data.toString();

      // 1. Save to database
      const savedMessage = await prisma.message.create({
        data: {
          itineraryId,
          senderId: userId,
          text: messageText,
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      // 2. Broadcast to everyone in the room
      const roomUsers = rooms.get(itineraryId);
      if (roomUsers) {
        const payload = JSON.stringify({
          type: "message",
          message: savedMessage,
        });

        for (const roomUserId of roomUsers) {
          const clientWs = clients.get(roomUserId);
          if (clientWs && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(payload);
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log(`User ${userId} left room ${itineraryId}`);
    clients.delete(userId);
    const roomUsers = rooms.get(itineraryId);
    if (roomUsers) {
      roomUsers.delete(userId);
      if (roomUsers.size === 0) {
        rooms.delete(itineraryId);
      }
    }
  });
});

console.log(`WebSocket server running on ws://localhost:${port}`);
