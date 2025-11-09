import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, Camera, Mic, Smile, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { compressImage } from "@/utils/imageCompression";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

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

const ChatWindow = ({ conversationId, otherUser, currentUserId, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useVoiceRecording();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
    const unsubscribe = subscribeToMessages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    console.log("Loading messages for conversation:", conversationId);
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      return;
    }

    console.log("Loaded messages:", data);
    setMessages((data || []) as Message[]);

    // Mark messages as read
    if (data && data.length > 0) {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", currentUserId)
        .eq("read", false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            // Prevent duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg as Message];
          });
          setIsTyping(false);

          // Mark as read if it's not from current user
          if (newMsg.receiver_id === currentUserId) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id)
              .then(() => {
                console.log("Message marked as read");
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const uploadFile = async (file: Blob, folder: 'images' | 'voice'): Promise<string | null> => {
    try {
      const fileExt = folder === 'images' ? 'jpg' : 'webm';
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('user-media')
        .upload(filePath, file, {
          contentType: folder === 'images' ? 'image/jpeg' : 'audio/webm',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
      return null;
    }
  };

  const sendMessage = async (messageType: 'text' | 'image' | 'voice' | 'emoji' = 'text', mediaUrl?: string) => {
    if (messageType === 'text' && !newMessage.trim()) return;

    console.log("Sending message:", {
      conversation_id: conversationId,
      sender_id: currentUserId,
      receiver_id: otherUser.id,
      content: newMessage || (messageType === 'image' ? '📷 Photo' : messageType === 'voice' ? '🎤 Voice message' : ''),
      message_type: messageType,
      media_url: mediaUrl,
    });

    const { data, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      receiver_id: otherUser.id,
      content: newMessage || (messageType === 'image' ? '📷 Photo' : messageType === 'voice' ? '🎤 Voice message' : ''),
      message_type: messageType,
      media_url: mediaUrl,
    }).select();

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    console.log("Message sent successfully:", data);
    setNewMessage("");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const compressedImage = await compressImage(file);
      const mediaUrl = await uploadFile(compressedImage, 'images');
      
      if (mediaUrl) {
        await sendMessage('image', mediaUrl);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      setIsUploading(true);
      try {
        const audioBlob = await stopRecording();
        const mediaUrl = await uploadFile(audioBlob, 'voice');
        
        if (mediaUrl) {
          await sendMessage('voice', mediaUrl);
        }
      } catch (error) {
        console.error('Error sending voice message:', error);
      } finally {
        setIsUploading(false);
      }
    } else {
      startRecording();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      {/* VibeLink watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
        <span className="text-6xl font-freestyle text-gradient-brand">VibeLink</span>
      </div>

      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg p-4 relative z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-white">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback className="bg-white text-primary">
              {otherUser.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-white text-lg">{otherUser.name}</CardTitle>
            {isTyping ? (
              <p className="text-xs text-white/80">typing...</p>
            ) : isOnline ? (
              <p className="text-xs text-white/80">● Online</p>
            ) : null}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.map((message) => {
          const isSender = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isSender
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.message_type === 'image' && message.media_url && (
                  <img 
                    src={message.media_url} 
                    alt="Shared photo" 
                    className="rounded-lg max-w-full h-auto mb-2 cursor-pointer"
                    onClick={() => window.open(message.media_url, '_blank')}
                  />
                )}
                {message.message_type === 'voice' && message.media_url && (
                  <audio controls className="max-w-full mb-2">
                    <source src={message.media_url} type="audio/webm" />
                    Your browser does not support audio playback.
                  </audio>
                )}
                <p className="text-sm break-words">{message.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p
                    className={`text-xs ${
                      isSender ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {isSender && message.read && (
                    <span className="text-xs text-white/70">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t relative z-10 bg-background">
        {isRecording && (
          <div className="mb-2 p-2 bg-destructive/10 rounded-md flex items-center justify-between">
            <span className="text-sm text-destructive">🎤 Recording: {recordingTime}s</span>
            <Button variant="ghost" size="sm" onClick={cancelRecording}>
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRecording}
            title="Upload photo"
          >
            <Camera className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceRecording}
            disabled={isUploading}
            title={isRecording ? "Stop recording" : "Start voice recording"}
            className={isRecording ? "text-destructive" : ""}
          >
            {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isUploading || isRecording}
                title="Emoji picker"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-0" align="start">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </PopoverContent>
          </Popover>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isUploading || isRecording}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!newMessage.trim() || isUploading || isRecording}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;
