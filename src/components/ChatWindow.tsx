import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X, Smile, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  message_type: 'text' | 'image' | 'voice' | 'emoji';
  media_url?: string;
}

interface ChatWindowProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  currentUserId: string;
  onClose: () => void;
}

// Mask personal contact details in outgoing messages
function maskContactDetails(text: string): string {
  // Phone numbers (various formats)
  text = text.replace(/(\+?\d[\s\-.]?){7,15}/g, "[📵 phone hidden]");
  // Email addresses
  text = text.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "[📧 email hidden]");
  // Social handles: @username or instagram.com, snapchat.com, tiktok.com, etc.
  text = text.replace(/(instagram|snapchat|tiktok|snap|ig|sc)\s*[:=]?\s*@?[\w.]+/gi, "[🔒 handle hidden]");
  text = text.replace(/@[\w.]{3,}/g, "[🔒 handle hidden]");
  // URLs that might carry contact info
  text = text.replace(/https?:\/\/[^\s]+/g, "[🔗 link hidden]");
  return text;
}

const ChatWindow = ({ conversationId, otherUser, currentUserId, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [photoUnlockStatus, setPhotoUnlockStatus] = useState<string>("locked");
  const [unlockRequesting, setUnlockRequesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadConversationStatus();
    const unsubMessages = subscribeToMessages();
    const unsubTyping = subscribeToTyping();
    return () => {
      if (unsubMessages) unsubMessages();
      if (unsubTyping) unsubTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversationStatus = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("conversations")
      .select("photo_unlock_status")
      .eq("id", conversationId)
      .maybeSingle();
    if (data) setPhotoUnlockStatus((data as any).photo_unlock_status || "locked");
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) { console.error("Error loading messages:", error); return; }
    setMessages((data || []) as Message[]);
    if (data && data.length > 0) {
      await supabase.from("messages").update({ read: true }).eq("conversation_id", conversationId).eq("receiver_id", currentUserId).eq("read", false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const newMsg = payload.new as any;
        setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg as Message]);
        setIsTyping(false);
        if (newMsg.receiver_id === currentUserId) {
          supabase.from("messages").update({ read: true }).eq("id", newMsg.id).then(() => {});
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "typing_status", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const typingData = payload.new as any;
        if (typingData.user_id !== currentUserId) setIsTyping(typingData.is_typing);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const updateTypingStatus = async (typing: boolean) => {
    await supabase.from("typing_status").upsert({ conversation_id: conversationId, user_id: currentUserId, is_typing: typing, updated_at: new Date().toISOString() }, { onConflict: 'conversation_id,user_id' });
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    updateTypingStatus(true);
    typingTimeoutRef.current = setTimeout(() => updateTypingStatus(false), 2000);
  };

  const sendMessage = async (type: 'text' | 'emoji' = 'text') => {
    if (!newMessage.trim()) return;
    if (!conversationId) { toast({ title: "Error", description: "No active conversation", variant: "destructive" }); return; }

    const masked = maskContactDetails(newMessage);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      receiver_id: otherUser.id,
      content: masked,
      message_type: type,
    }).select();

    if (error) { toast({ title: "Error", description: `Failed to send message: ${error.message}`, variant: "destructive" }); return; }

    setNewMessage("");
    updateTypingStatus(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Photo unlock flow
  const handleRequestUnlock = async () => {
    setUnlockRequesting(true);
    try {
      // Determine which user is user1 vs user2 for status tracking
      const { data: conv } = await supabase
        .from("conversations")
        .select("user1_id, user2_id, photo_unlock_status")
        .eq("id", conversationId)
        .maybeSingle();

      if (!conv) return;

      const isUser1 = (conv as any).user1_id === currentUserId;
      const currentStatus = (conv as any).photo_unlock_status || "locked";

      let newStatus = currentStatus;

      if (currentStatus === "locked") {
        newStatus = isUser1 ? "user1_requested" : "user2_requested";
      } else if (
        (currentStatus === "user1_requested" && !isUser1) ||
        (currentStatus === "user2_requested" && isUser1)
      ) {
        newStatus = "unlocked";
      }

      await supabase.from("conversations").update({ photo_unlock_status: newStatus } as any).eq("id", conversationId);
      setPhotoUnlockStatus(newStatus);

      if (newStatus === "unlocked") {
        toast({ title: "Photos unlocked!", description: "You can now see each other's profile photos." });
      } else {
        toast({ title: "Request sent!", description: "Waiting for your match to accept photo sharing." });
      }
    } finally {
      setUnlockRequesting(false);
    }
  };

  const isPhotosUnlocked = photoUnlockStatus === "unlocked";
  const hasRequestedUnlock = photoUnlockStatus !== "locked";
  const otherRequested =
    (photoUnlockStatus === "user1_requested") || (photoUnlockStatus === "user2_requested");

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] z-0 select-none">
        <div className="transform -rotate-45">
          <span className="text-8xl font-freestyle bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">VibeLink</span>
        </div>
      </div>

      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg p-4 relative z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-white">
            <AvatarFallback className="bg-white text-primary font-bold">{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-white text-lg">{otherUser.name}</CardTitle>
            {isTyping && <p className="text-xs text-white/80">typing...</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPhotosUnlocked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRequestUnlock}
              disabled={unlockRequesting}
              className="text-white hover:bg-white/20 text-xs px-2"
              title="Request photo unlock"
            >
              <Camera className="h-4 w-4 mr-1" />
              {photoUnlockStatus === "locked" ? "Unlock Photos" : "Accept"}
            </Button>
          )}
          {isPhotosUnlocked && (
            <span className="text-xs text-white/80 flex items-center gap-1">
              <Camera className="h-3 w-3" /> Photos on
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Photo unlock banner */}
      {otherRequested && !isPhotosUnlocked && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 relative z-10 flex items-center justify-between">
          <p className="text-xs text-primary font-medium">Your match wants to share photos!</p>
          <Button size="sm" className="text-xs h-7" onClick={handleRequestUnlock} disabled={unlockRequesting}>
            Accept
          </Button>
        </div>
      )}

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.map((message) => {
          const isSender = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={`flex ${isSender ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 transition-all ${isSender ? "bg-gradient-to-r from-primary to-secondary text-white" : "bg-muted text-foreground"}`}>
                {message.message_type === 'image' && message.media_url && isPhotosUnlocked && (
                  <img src={message.media_url} alt="Shared photo" className="rounded-lg max-w-full h-auto mb-2 cursor-pointer" onClick={() => window.open(message.media_url, '_blank')} />
                )}
                {message.message_type === 'image' && message.media_url && !isPhotosUnlocked && (
                  <div className="rounded-lg bg-muted/50 h-24 flex items-center justify-center mb-2 text-xs text-muted-foreground">🔒 Photo (unlock to view)</div>
                )}
                {message.message_type === 'voice' && message.media_url && (
                  <audio controls className="max-w-full mb-2"><source src={message.media_url} type="audio/webm" /></audio>
                )}
                <p className="text-sm break-words">{message.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-xs ${isSender ? "text-white/70" : "text-muted-foreground"}`}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {isSender && message.read && <span className="text-xs text-white/70">✓✓</span>}
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
              <Button variant="ghost" size="icon" title="Emoji picker">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-0" align="start">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </PopoverContent>
          </Popover>
          <Input
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">Contact details are automatically protected</p>
      </div>
    </Card>
  );
};

export default ChatWindow;
