import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWindow from "@/components/ChatWindow";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  unreadCount: number;
  userId: string;
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadConversations();
  }, []);

  const checkAuthAndLoadConversations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    setCurrentUserId(session.user.id);
    await loadConversations(session.user.id);
    setLoading(false);
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

    setConversations(convos);
  };

  const getOrCreateConversation = async (user1Id: string, user2Id: string): Promise<string | null> => {
    // Sort IDs to ensure consistent ordering
    const [userId1, userId2] = [user1Id, user2Id].sort();

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
      return existing.id;
    }

    // Create new conversation
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-romantic-50 via-white to-romantic-100">
        <Header />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-50 via-white to-romantic-100">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-freestyle text-gradient-brand mb-4">
              Messages
            </h1>
            <p className="text-muted-foreground">
              Continue your conversations
            </p>
          </div>

          {conversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Conversations Yet</h3>
                <p className="text-muted-foreground">
                  Start matching with people to begin chatting!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleOpenChat(conversation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={conversation.avatar || undefined} />
                        <AvatarFallback className="text-xl">
                          {conversation.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold">
                            {conversation.name}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="bg-primary">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {conversation.lastMessage}
                        </p>
                      </div>

                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {activeChatUser && (
        <ChatWindow
          conversationId={conversations.find(c => c.userId === activeChatUser.id)?.id || ""}
          otherUser={activeChatUser}
          currentUserId={currentUserId}
          onClose={handleCloseChat}
        />
      )}

      <Footer />
    </div>
  );
};

export default Messages;
