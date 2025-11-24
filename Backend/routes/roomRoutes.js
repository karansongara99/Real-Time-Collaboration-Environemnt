import express from "express";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// Create room
router.post("/", protect, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });
  const room = await Room.create({ name, owner: req.user._id, members: [req.user._id] });
  res.status(201).json(room);
});

// Get rooms of current user (member)
router.get("/", protect, async (req, res) => {
  const rooms = await Room.find({ members: req.user._id }).select("_id name owner members");
  res.json(rooms);
});

// Join room by id
router.post("/:id/join", protect, async (req, res) => {
  const { id } = req.params;
  const room = await Room.findById(id);
  if (!room) return res.status(404).json({ message: "Room not found" });
  if (!room.members.some(m => m.toString() === req.user._id.toString())) {
    room.members.push(req.user._id);
    await room.save();
  }
  res.json(room);
});

// Room users
router.get("/:id/users", protect, async (req, res) => {
  const room = await Room.findById(req.params.id).populate("members", "name email");
  if (!room) return res.status(404).json({ message: "Room not found" });
  res.json(room.members);
});

// Room messages history (latest 100)
router.get("/:id/messages", protect, async (req, res) => {
  const messages = await Message.find({ room: req.params.id })
    .sort({ createdAt: 1 })
    .limit(100)
    .populate("sender", "name email");
  res.json(messages.map(m => ({
    _id: m._id,
    text: m.text,
    sender: { _id: m.sender._id, name: m.sender.name },
    createdAt: m.createdAt
  })));
});

export default router;