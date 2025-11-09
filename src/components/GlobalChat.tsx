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

    // Get or create conversations for each match
    const convos: Conversation[] = [];
    
    for (const match of matches || []) {
      const profile = profiles?.find(p => p.user_id === match.matched_user_id);
      
      // Ensure conversation exists (create if not)
      const conversationId = await getOrCreateConversation(userId, match.matched_user_id);
      
      if (conversationId) {
        convos.push({
          id: conversationId,
          userId: match.matched_user_id,
          name: profile?.first_name || "Unknown User",
          avatar: profile?.profile_photo_url,
          lastMessage: "Start chatting...",
          unreadCount: 0
        });
      }
    }

    console.log("Loaded conversations:", convos);
    setConversations(convos);
  };

  const getOrCreateConversation = async (user1Id: string, user2Id: string): Promise<string | null> => {
    // Sort IDs to ensure consistent ordering
    const [userId1, userId2] = [user1Id, user2Id].sort();
    
    console.log("Getting or creating conversation for:", userId1, "and", userId2);

    // Check if conversation exists
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      return null;
    }

    if (existing) {
      console.log("Found existing conversation:", existing.id);
      return existing.id;
    }

    // Create new conversation
    console.log("Creating new conversation...");
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        user1_id: userId1,
        user2_id: userId2
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    console.log("Created new conversation:", newConv?.id);
    return newConv?.id || null;
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
