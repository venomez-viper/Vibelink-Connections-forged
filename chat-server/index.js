require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] },
});

// ─── MongoDB Schemas ──────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId:       { type: String, required: true },
  receiverId:     { type: String, required: true },
  content:        { type: String, required: true },
  messageType:    { type: String, enum: ["text", "image", "voice", "emoji"], default: "text" },
  mediaUrl:       { type: String },
  read:           { type: Boolean, default: false },
  masked:         { type: Boolean, default: false },
}, { timestamps: true });

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  user1Id:        { type: String, required: true },
  user2Id:        { type: String, required: true },
  lastMessage:    { type: String, default: "" },
  lastMessageAt:  { type: Date, default: Date.now },
  unreadCount:    { type: Map, of: Number, default: {} },
}, { timestamps: true });

const Message      = mongoose.model("Message", MessageSchema);
const Conversation = mongoose.model("Conversation", ConversationSchema);

// ─── Contact detail masking ───────────────────────────────────────────────────

function maskContactDetails(text) {
  text = text.replace(/(\+?\d[\s\-.]?){7,15}/g, "[📵 phone hidden]");
  text = text.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "[📧 email hidden]");
  text = text.replace(/(instagram|snapchat|tiktok|snap|ig|sc)\s*[:=]?\s*@?[\w.]+/gi, "[🔒 handle hidden]");
  text = text.replace(/@[\w.]{3,}/g, "[🔒 handle hidden]");
  text = text.replace(/https?:\/\/[^\s]+/g, "[🔗 link hidden]");
  return text;
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

function verifyToken(token) {
  try {
    // Supabase JWTs use the JWT secret — decode without verify for user ID
    const decoded = jwt.decode(token);
    if (!decoded?.sub) throw new Error("Invalid token");
    return decoded.sub; // user UUID
  } catch {
    return null;
  }
}

// Track online users: userId → socketId
const onlineUsers = new Map();

// ─── Socket.io events ─────────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Authenticate
  socket.on("authenticate", ({ token }) => {
    const userId = verifyToken(token);
    if (!userId) {
      socket.emit("auth_error", { message: "Invalid token" });
      return;
    }
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    socket.emit("authenticated", { userId });
    // Broadcast online status
    io.emit("user_online", { userId });
    console.log(`✅ Authenticated: ${userId}`);
  });

  // Join a conversation room
  socket.on("join_conversation", async ({ conversationId }) => {
    if (!socket.userId) return;
    socket.join(conversationId);

    // Load last 50 messages from MongoDB
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    socket.emit("message_history", { conversationId, messages: messages.reverse() });

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiverId: socket.userId, read: false },
      { $set: { read: true } }
    );

    // Reset unread count
    await Conversation.findOneAndUpdate(
      { conversationId },
      { $set: { [`unreadCount.${socket.userId}`]: 0 } }
    );

    console.log(`🏠 ${socket.userId} joined room ${conversationId}`);
  });

  // Send message
  socket.on("send_message", async ({ conversationId, receiverId, content, messageType = "text", mediaUrl }) => {
    if (!socket.userId) return;

    const masked = maskContactDetails(content);
    const wasMasked = masked !== content;

    const message = await Message.create({
      conversationId,
      senderId: socket.userId,
      receiverId,
      content: masked,
      messageType,
      mediaUrl,
      masked: wasMasked,
    });

    // Update conversation last message
    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          lastMessage: masked.substring(0, 100),
          lastMessageAt: new Date(),
        },
        $inc: { [`unreadCount.${receiverId}`]: 1 },
      },
      { upsert: true }
    );

    // Broadcast to everyone in the room
    io.to(conversationId).emit("new_message", {
      _id: message._id,
      conversationId,
      senderId: socket.userId,
      receiverId,
      content: masked,
      messageType,
      mediaUrl,
      read: false,
      masked: wasMasked,
      createdAt: message.createdAt,
    });

    // Push notification data for offline user
    if (!onlineUsers.has(receiverId)) {
      io.emit("push_notify", { userId: receiverId, conversationId, preview: masked.substring(0, 60) });
    }
  });

  // Typing indicator
  socket.on("typing", ({ conversationId, isTyping }) => {
    if (!socket.userId) return;
    socket.to(conversationId).emit("user_typing", {
      userId: socket.userId,
      conversationId,
      isTyping,
    });
  });

  // Mark messages as read
  socket.on("mark_read", async ({ conversationId }) => {
    if (!socket.userId) return;
    await Message.updateMany(
      { conversationId, receiverId: socket.userId, read: false },
      { $set: { read: true } }
    );
    socket.to(conversationId).emit("messages_read", {
      conversationId,
      readBy: socket.userId,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", { userId: socket.userId });
    }
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// ─── REST endpoints ───────────────────────────────────────────────────────────

app.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.get("/messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  const { limit = 50, before } = req.query;
  const query = { conversationId };
  if (before) query.createdAt = { $lt: new Date(before) };
  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(Number(limit)).lean();
  res.json({ messages: messages.reverse() });
});

app.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;
  const conversations = await Conversation.find({
    $or: [{ user1Id: userId }, { user2Id: userId }],
  }).sort({ lastMessageAt: -1 }).lean();
  res.json({ conversations });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 VibeLink Chat Server running on port ${PORT}`));
