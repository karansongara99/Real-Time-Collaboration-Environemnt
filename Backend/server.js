import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import Message from "./models/Message.js";
import Room from "./models/Room.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET","POST"] },
});

// Socket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("no token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch {
    next(new Error("invalid token"));
  }
});

const roomPresence = new Map(); // roomId -> Set(socketIds)

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ roomId }) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return;
      socket.join(roomId);
      // presence
      if (!roomPresence.has(roomId)) roomPresence.set(roomId, new Set());
      roomPresence.get(roomId).add(socket.id);
      io.to(roomId).emit("presence", { count: roomPresence.get(roomId).size });
    } catch {}
  });

  socket.on("message", async ({ roomId, text }) => {
    if (!text?.trim()) return;
    const msg = await Message.create({ room: roomId, sender: socket.user.id, text });
    io.to(roomId).emit("message", {
      _id: msg._id,
      text: msg.text,
      sender: { _id: socket.user.id },
      createdAt: msg.createdAt,
    });
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomPresence.has(roomId)) {
        const set = roomPresence.get(roomId);
        set.delete(socket.id);
        io.to(roomId).emit("presence", { count: set.size });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));