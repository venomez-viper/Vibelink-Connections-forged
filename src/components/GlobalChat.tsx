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
    // Fetch matches (accepted match requests)
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        profiles!matches_user1_id_fkey(user_id, first_name, profile_photo_url),
        profiles_matches_user2_id_fkey:profiles!matches_user2_id_fkey(user_id, first_name, profile_photo_url)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    // Transform matches into conversations
    const convos: Conversation[] = matches?.map((match: any) => {
      const otherUser = match.user1_id === userId 
        ? match.profiles_matches_user2_id_fkey 
        : match.profiles;
      
      return {
        id: match.id,
        userId: otherUser.user_id,
        name: otherUser.first_name || "Unknown User",
        avatar: otherUser.profile_photo_url,
        lastMessage: "Start chatting...",
        unreadCount: 0
      };
    }) || [];

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
