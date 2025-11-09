import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FloatingChatButton from "./FloatingChatButton";
import ChatWindow from "./ChatWindow";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  unreadCount: number;
  userId: string;
}

const GlobalChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    checkAuthAndLoadConversations();
  }, []);

  const checkAuthAndLoadConversations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setConversations([]);
      return;
    }

    setCurrentUserId(session.user.id);
    await loadConversations(session.user.id);
  };

  const loadConversations = async (userId: string) => {
    // Fetch matches where user_id equals current user
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        matched_user_id
      `)
      .eq('user_id', userId);

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    // Fetch profile details for matched users
    const matchedUserIds = matches?.map(m => m.matched_user_id) || [];
    
    if (matchedUserIds.length === 0) {
      setConversations([]);
      return;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, profile_photo_url')
      .in('user_id', matchedUserIds);

    // Transform matches into conversations
    const convos: Conversation[] = matches?.map((match: any) => {
      const profile = profiles?.find(p => p.user_id === match.matched_user_id);
      
      return {
        id: match.id, // This is the match UUID - used as conversation_id
        userId: match.matched_user_id,
        name: profile?.first_name || "Unknown User",
        avatar: profile?.profile_photo_url,
        lastMessage: "Start chatting...",
        unreadCount: 0
      };
    }) || [];

    console.log("Loaded conversations:", convos);
    setConversations(convos);
  };

  const handleOpenChat = (conversation: Conversation) => {
    setActiveChatUser({
      id: conversation.userId,
      name: conversation.name,
      avatar: conversation.avatar
    });
  };

  const handleCloseChat = () => {
    setActiveChatUser(null);
  };

  // Don't show on login/signup pages
  const shouldShowChat = currentUserId && 
    !window.location.pathname.includes('/login') && 
    !window.location.pathname.includes('/signup');

  if (!shouldShowChat) return null;

  return (
    <>
      <FloatingChatButton 
        conversations={conversations} 
        onOpenChat={handleOpenChat}
      />
      
      {activeChatUser && (
        <ChatWindow
          conversationId={conversations.find(c => c.userId === activeChatUser.id)?.id || ""}
          otherUser={activeChatUser}
          currentUserId={currentUserId}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
};

export default GlobalChat;
