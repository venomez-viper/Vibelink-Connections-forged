import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X, Smile, Camera, Wifi, WifiOff, ArrowLeft, Image as ImageIcon, Sparkles, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { connectSocket, getSocket } from "@/utils/socket";
import { motion } from "framer-motion";

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
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#1A0B10] app-theme animate-in fade-in duration-300">
      
      {/* Vibe Room Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#1A0B10]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-transparent">
                <AvatarFallback className="bg-surface-container-high font-bold text-white">{otherUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-[#1A0B10]"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold flex items-center gap-2">
                {otherUser.name}
              </span>
              <span className="text-[10px] tracking-widest text-[#FF4D6D] font-bold uppercase block">Vibe Room Active</span>
            </div>
          </div>
        </div>
        
        <button className="text-white/50 hover:text-white transition-colors cursor-pointer">
          <Camera className="w-5 h-5" />
        </button>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-24 py-8 space-y-8 relative z-10 w-full max-w-4xl mx-auto flex flex-col">
        
        {/* Aesthetic Background Accents */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="flex-1 flex flex-col justify-end space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center opacity-50">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <p className="text-white text-lg font-freestyle">Your journey begins here.</p>
            </div>
          )}

          {/* Chat History */}
          {messages.map((msg, i) => {
            const isSender = msg.senderId === currentUserId;
            // Format time
            const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
            
            return (
              <div key={msg._id || msg.id || i} className={`w-full flex flex-col ${isSender ? "items-end" : "items-start"} animate-in slide-in-from-bottom-2`}>
                <div 
                  className={`px-5 py-3.5 relative shadow-ambient inline-flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${
                    isSender 
                      ? "text-white rounded-[24px] rounded-br-[8px]" 
                      : "text-slate-200 rounded-[24px] rounded-bl-[8px] bg-surface-container border border-surface-variant/50"
                  }`}
                  style={isSender ? { background: "linear-gradient(135deg, #DF154A 0%, #8C0B29 100%)" } : {}}
                >
                  <p className="text-[15px] leading-relaxed break-words font-medium tracking-wide">
                    {msg.content}
                  </p>
                  {/* Visual mockup lock icon for phone numbers */}
                  {msg.content.match(/\d{3}/) && isSender && (
                    <Lock className="w-3.5 h-3.5 text-white/50 ml-1 inline-block shrink-0" />
                  )}
                </div>
                {timeStr && (
                  <div className="text-[10px] text-white/30 font-semibold px-2 flex items-center gap-1 mt-1.5 uppercase tracking-wider">
                    {isSender ? "Today" : "Today"} {timeStr}
                    {isSender && <span className="text-[9px] text-white/40 ml-1">✓✓</span>}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mockup Interactive Prompt: Authentic Connection (Other requested) */}
          {otherRequested && !isUnlocked && (
             <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
               className="w-full max-w-2xl mx-auto rounded-[32px] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-ambient"
               style={{ background: "linear-gradient(90deg, #ff4c6c 0%, #a40828 100%)", backdropFilter: "blur(20px)" }}
             >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                      <ImageIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                   </div>
                   <div className="text-left">
                      <h3 className="text-white font-bold text-lg lg:text-xl">Authentic Connection</h3>
                      <p className="text-white/80 text-sm lg:text-base">{otherUser.name} wants to share her private album with you.</p>
                   </div>
                </div>
                <Button 
                  onClick={handleRequestUnlock} disabled={unlockRequesting}
                  className="rounded-full bg-white text-[#c1003a] hover:bg-white/90 font-bold px-8 py-6 shadow-xl shrink-0 border-0"
                >
                  Unlock Photos
                </Button>
             </motion.div>
          )}

          {/* Mockup Interactive Prompt: Vibe Check (I requested) */}
          {photoUnlockStatus === "locked" && !otherRequested && messages.length > 2 && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-2xl mx-auto rounded-[24px] p-6 flex flex-col gap-4 shadow-ambient border border-white/5 bg-[#251419]"
             >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <ImageIcon className="w-5 h-5 text-white/50" />
                     </div>
                     <div className="text-left">
                        <h3 className="text-white font-bold text-base">Vibe Check!</h3>
                        <p className="text-white/60 text-xs md:text-sm">Your match wants to share photos! Exchange 3 more messages to reveal.</p>
                     </div>
                  </div>
                  <span className="text-[10px] font-bold text-white/30 tracking-widest bg-white/5 px-2 py-1 rounded-sm uppercase">NEW</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-[#DF154A] to-[#FF4D6D] w-[66%] rounded-full shadow-[0_0_10px_#DF154A]" />
                  </div>
                  <div className="text-right text-[11px] text-white/50 font-bold tracking-widest">2/3</div>
                </div>
             </motion.div>
          )}

          {isTyping && (
            <div className="flex justify-start pt-2">
               <div className="text-[10px] tracking-widest text-white/30 font-bold uppercase flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2">{otherUser.name.toUpperCase()} IS TYPING...</span>
               </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Vibe Room Input Area (Bottom docked) */}
      <div className="px-4 md:px-12 lg:px-24 py-8 bg-transparent relative z-20 w-full max-w-4xl mx-auto mt-auto">
        <div className="relative flex items-center">
          <Input 
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={connected ? "Type a message..." : "Connecting to chat..."}
            className="w-full bg-[#251419]/80 backdrop-blur-md border-transparent text-white placeholder:text-white/30 rounded-full pl-6 pr-14 py-7 text-[15px] focus-visible:ring-1 focus-visible:ring-primary/50 shadow-ambient" 
            disabled={!connected} 
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || !connected} 
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-[#C1003A] hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform active:scale-95 flex items-center justify-center cursor-pointer border-0"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
