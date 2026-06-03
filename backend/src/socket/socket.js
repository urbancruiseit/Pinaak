import { Server } from "socket.io";
import registerSocketEvents from "./events/index.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    // ✅ FIXED: WebSocket force kiya — polling band
    transports: ["websocket"],

    cors: {
      origin: (process.env.CORS_ORIGIN || "http://localhost:3000")
        .split(",")
        .map((o) => o.trim().replace(/\/$/, "")),
      credentials: true,
      methods: ["GET", "POST"],
    },

    // ✅ Performance settings
    pingTimeout: 60000, // 60s — connection jaldi band na ho
    pingInterval: 25000, // 25s — ping interval
  });

  io.on("connection", (socket) => {
    console.log(
      "🟢 User Connected:",
      socket.id,
      "| Transport:",
      socket.conn.transport.name,
    );

    registerSocketEvents(socket, io);

    socket.on("disconnect", (reason) => {
      console.log("🔴 User Disconnected:", socket.id, "| Reason:", reason);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
