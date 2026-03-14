import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X, Smile, Camera, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { connectSocket, getSocket } from "@/utils/socket";

interface Message {
  _id?: string;
  id?: string;
  senderId?: string;
  receiverId?: string;
  content: string;
  createdAt?: string;
  read: boolean;
  messageType?: string;
  mediaUrl?: string;
  masked?: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  otherUser: { id: string; name: string; avatar?: string };
  currentUserId: string;
  onClose: () => void;
}

const ChatWindow = ({ conversationId, otherUser, currentUserId, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [connected, setConnected] = useState(false);
  const [photoUnlockStatus, setPhotoUnlockStatus] = useState<string>("locked");
  const [unlockRequesting, setUnlockRequesting] = useState(false);
  const [starters, setStarters] = useState<string[]>([]);
  const [loadingStarters, setLoadingStarters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initSocket();
    loadConversationStatus();
    return () => cleanupSocket();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && conversationId && !loadingStarters && starters.length === 0) {
      loadStarters();
    }
  }, [messages, conversationId]);

  const normalize = (m: any): Message => ({
    ...m,
    senderId: m.senderId || m.sender_id,
    receiverId: m.receiverId || m.receiver_id,
    createdAt: m.createdAt || m.created_at,
    messageType: m.messageType || m.message_type || "text",
    mediaUrl: m.mediaUrl || m.media_url,
  });

  const initSocket = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const socket = connectSocket(session.access_token);
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_conversation", { conversationId });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("authenticated", () => socket.emit("join_conversation", { conversationId }));
    socket.on("message_history", ({ messages: history }: { messages: any[] }) => setMessages(history.map(normalize)));
    socket.on("new_message", (msg: any) => {
      setMessages((prev) => prev.some((m) => m._id === msg._id) ? prev : [...prev, normalize(msg)]);
      setIsTyping(false);
      if (msg.receiverId === currentUserId) getSocket().emit("mark_read", { conversationId });
    });
    socket.on("user_typing", ({ userId, isTyping: t }: any) => { if (userId !== currentUserId) setIsTyping(t); });
    socket.on("messages_read", () => setMessages((prev) => prev.map((m) => ({ ...m, read: true }))));
  };

  const cleanupSocket = () => {
    const s = getSocket();
    ["connect","disconnect","authenticated","message_history","new_message","user_typing","messages_read"].forEach((e) => s.off(e));
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const loadConversationStatus = async () => {
    const { data } = await supabase.from("conversations").select("photo_unlock_status").eq("id", conversationId).maybeSingle();
    if (data) setPhotoUnlockStatus((data as any).photo_unlock_status || "locked");
  };

  const loadStarters = async () => {
    setLoadingStarters(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-conversation-starters", {
        body: { conversationId, userAId: currentUserId, userBId: otherUser.id },
      });
      if (!error && data?.starters?.length) setStarters(data.starters);
    } catch (e) { console.error("Starters error:", e); }
    finally { setLoadingStarters(false); }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const socket = getSocket();
    if (!socket.connected) { toast({ title: "Not connected", variant: "destructive" }); return; }
    socket.emit("send_message", { conversationId, receiverId: otherUser.id, content: newMessage, messageType: "text" });
    setNewMessage("");
    socket.emit("typing", { conversationId, isTyping: false });
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket.connected) return;
    socket.emit("typing", { conversationId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("typing", { conversationId, isTyping: false }), 2000);
  };

  const handleEmojiClick = (e: EmojiClickData) => { setNewMessage((p) => p + e.emoji); setShowEmojiPicker(false); };

  const handleRequestUnlock = async () => {
    setUnlockRequesting(true);
    try {
      const { data: conv } = await supabase.from("conversations").select("user1_id,user2_id,photo_unlock_status").eq("id", conversationId).maybeSingle();
      if (!conv) return;
      const isUser1 = (conv as any).user1_id === currentUserId;
      const cur = (conv as any).photo_unlock_status || "locked";
      let next = cur;
      if (cur === "locked") next = isUser1 ? "user1_requested" : "user2_requested";
      else if ((cur === "user1_requested" && !isUser1) || (cur === "user2_requested" && isUser1)) next = "unlocked";
      await supabase.from("conversations").update({ photo_unlock_status: next } as any).eq("id", conversationId);
      setPhotoUnlockStatus(next);
      toast({ title: next === "unlocked" ? "Photos unlocked! 📸" : "Request sent!", description: next === "unlocked" ? "You can now see each other's photos." : "Waiting for match to accept." });
    } finally { setUnlockRequesting(false); }
  };

  const isUnlocked = photoUnlockStatus === "unlocked";
  const otherRequested = photoUnlockStatus === "user1_requested" || photoUnlockStatus === "user2_requested";

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0 select-none">
        <span className="text-8xl font-freestyle -rotate-45 inline-block" style={{ color: "#C1003A" }}>VibeLink</span>
      </div>

      <CardHeader className="flex flex-row items-center justify-between rounded-t-lg p-4 relative z-10 text-white" style={{ background: "linear-gradient(135deg, #C1003A, #8B0028)" }}>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-white">
            <AvatarFallback className="bg-white font-bold text-[#C1003A]">{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-white text-lg">{otherUser.name}</CardTitle>
            <p className="text-xs text-white/70 flex items-center gap-1">
              {connected ? <><Wifi className="h-3 w-3" /> Live</> : <><WifiOff className="h-3 w-3" /> Connecting...</>}
              {isTyping && " · typing..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isUnlocked && (
            <Button variant="ghost" size="sm" onClick={handleRequestUnlock} disabled={unlockRequesting} className="text-white hover:bg-white/20 text-xs px-2">
              <Camera className="h-3 w-3 mr-1" />{photoUnlockStatus === "locked" ? "Unlock Photos" : "Accept"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20"><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>

      {otherRequested && !isUnlocked && (
        <div className="px-4 py-2 z-10 flex items-center justify-between border-b border-primary/10 bg-primary/5">
          <p className="text-xs font-medium text-primary">Your match wants to share photos!</p>
          <Button size="sm" className="text-xs h-7 text-white" style={{ background: "#C1003A" }} onClick={handleRequestUnlock} disabled={unlockRequesting}>Accept</Button>
        </div>
      )}

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">✨ AI Icebreakers</p>
            <p className="text-xs text-muted-foreground text-center">Tap one to use as your opener</p>
            {loadingStarters ? (
              <div className="flex justify-center py-4 gap-1">
                {[0,150,300].map((d) => <div key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            ) : starters.map((s, i) => (
              <button key={i} onClick={() => { setNewMessage(s); setStarters([]); }}
                className="w-full text-left p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-sm leading-relaxed">
                <span className="text-primary mr-2">💬</span>{s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => {
          const isSender = msg.senderId === currentUserId;
          return (
            <div key={msg._id || msg.id || i} className={`flex ${isSender ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}>
              <div className={`max-w-[72%] rounded-2xl px-4 py-2 ${isSender ? "text-white" : "bg-muted text-foreground"}`}
                style={isSender ? { background: "linear-gradient(135deg, #C1003A, #8B0028)" } : {}}>
                {msg.messageType === "image" && msg.mediaUrl && (
                  isUnlocked
                    ? <img src={msg.mediaUrl} alt="Photo" className="rounded-lg max-w-full h-auto mb-2 cursor-pointer" onClick={() => window.open(msg.mediaUrl, "_blank")} />
                    : <div className="rounded-lg bg-black/10 h-20 flex items-center justify-center mb-2 text-xs">🔒 Photo locked</div>
                )}
                <p className="text-sm break-words">{msg.content}</p>
                {msg.masked && <p className="text-xs opacity-50 mt-0.5">Contact info protected</p>}
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-xs ${isSender ? "text-white/60" : "text-muted-foreground"}`}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                  {isSender && msg.read && <span className="text-xs text-white/60">✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t relative z-10 bg-background">
        <div className="flex gap-2 items-end">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-0" align="start">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </PopoverContent>
          </Popover>
          <Input value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={connected ? "Type a message..." : "Connecting to chat..."}
            className="flex-1" disabled={!connected} />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || !connected} size="icon"
            style={{ background: "linear-gradient(135deg, #C1003A, #8B0028)" }}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">Contact details are automatically protected</p>
      </div>
    </Card>
  );
};

export default ChatWindow;
