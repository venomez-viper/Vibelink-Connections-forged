import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Check, X, Heart, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Match {
  id: string;
  matched_user_id: string;
  compatibility_score: number;
  profile: {
    first_name: string;
    age: number;
    location: string;
    profile_photo_url: string | null;
    bio: string;
  };
}

interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  profile: {
    first_name: string;
    age: number;
    location: string;
    profile_photo_url: string | null;
  };
  type: 'sent' | 'received';
}

const Connections = () => {
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate('/login');
      return;
    }

    setUser(session.user);
    await loadActiveMatches(session.user.id);
    await loadPendingRequests(session.user.id);
    setLoading(false);
  };

  const loadActiveMatches = async (userId: string) => {
    // 1. Fetch only accepted match requests where current user is involved
    const { data: acceptedRequests, error: reqError } = await supabase
      .from('match_requests')
      .select('id, sender_id, receiver_id')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (reqError) {
      console.error("Error loading accepted requests:", reqError);
      return;
    }

    if (!acceptedRequests || acceptedRequests.length === 0) {
      setActiveMatches([]);
      return;
    }

    // 2. Map to extract the other user's ID
    const matchedUserIds = acceptedRequests.map(req =>
      req.sender_id === userId ? req.receiver_id : req.sender_id
    );

    // 3. Optionally fetch compatibility scores
    const { data: matchScores } = await supabase
      .from('matches')
      .select('matched_user_id, compatibility_score')
      .eq('user_id', userId)
      .in('matched_user_id', matchedUserIds);

    const scoreMap = new Map();
    matchScores?.forEach(m => scoreMap.set(m.matched_user_id, m.compatibility_score));

    // 4. Fetch profiles for matched users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, age, location, profile_photo_url, bio')
      .in('user_id', matchedUserIds);

    const matchesWithProfiles = matchedUserIds.map((targetUserId, index) => {
      const profile = profiles?.find(p => p.user_id === targetUserId);
      return {
        id: acceptedRequests[index].id, // Use the request ID as unique key
        matched_user_id: targetUserId,
        compatibility_score: scoreMap.get(targetUserId) || 75,
        profile: profile || {
          first_name: 'Unknown',
          age: 0,
          location: '',
          profile_photo_url: null,
          bio: ''
        }
      };
    });

    setActiveMatches(matchesWithProfiles);
  };

  const loadPendingRequests = async (userId: string) => {
    // Fetch sent requests
    const { data: sentRequests } = await supabase
      .from('match_requests')
      .select('id, sender_id, receiver_id, status, created_at')
      .eq('sender_id', userId)
      .eq('status', 'pending');

    // Fetch received requests
    const { data: receivedRequests } = await supabase
      .from('match_requests')
      .select('id, sender_id, receiver_id, status, created_at')
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    const allRequests = [
      ...(sentRequests || []).map(r => ({ ...r, type: 'sent' as const })),
      ...(receivedRequests || []).map(r => ({ ...r, type: 'received' as const }))
    ];

    if (allRequests.length === 0) {
      setPendingRequests([]);
      return;
    }

    // Fetch profiles
    const userIds = allRequests.map(r => r.type === 'sent' ? r.receiver_id : r.sender_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, age, location, profile_photo_url')
      .in('user_id', userIds);

    const requestsWithProfiles = allRequests.map(request => {
      const targetUserId = request.type === 'sent' ? request.receiver_id : request.sender_id;
      const profile = profiles?.find(p => p.user_id === targetUserId);
      return {
        ...request,
        profile: profile || {
          first_name: 'Unknown',
          age: 0,
          location: '',
          profile_photo_url: null
        }
      };
    });

    setPendingRequests(requestsWithProfiles);
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    // Update request status
    const { error: updateError } = await supabase
      .from('match_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
      return;
    }

    // Create match entries for both users
    const { error: matchError } = await supabase
      .from('matches')
      .insert([
        { user_id: user.id, matched_user_id: senderId, compatibility_score: 75 },
        { user_id: senderId, matched_user_id: user.id, compatibility_score: 75 }
      ]);

    if (matchError) {
      console.error("Error creating match:", matchError);
    }

    toast({
      title: "Match Accepted!",
      description: "You can now start chatting",
    });

    // Reload data
    await loadActiveMatches(user.id);
    await loadPendingRequests(user.id);
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('match_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request Rejected",
    });

    await loadPendingRequests(user.id);
  };

  const handleOpenChat = (matchedUserId: string, name: string, avatar: string | null) => {
    // Call GlobalChat's open function
    if ((window as any).openChatFromConnections) {
      (window as any).openChatFromConnections(matchedUserId, name, avatar || undefined);
    } else {
      toast({
        title: "Opening chat",
        description: `Starting conversation with ${name}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-romantic-50 via-white to-romantic-100">
        <Header />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading connections...</p>
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
              Your Connections
            </h1>
            <p className="text-muted-foreground">
              Manage your active matches and pending requests
            </p>
          </div>

          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Active Matches ({activeMatches.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Requests ({pendingRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-4">
              {activeMatches.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Active Matches Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start discovering people to make your first connection!
                    </p>
                    <Button onClick={() => navigate('/discover')} className="bg-gradient-to-r from-primary to-secondary">
                      Discover New People
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activeMatches.map((match) => (
                  <Card key={match.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={match.profile.profile_photo_url || undefined} />
                          <AvatarFallback className="text-2xl">
                            {match.profile.first_name[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-semibold">
                              {match.profile.first_name}, {match.profile.age}
                            </h3>
                            <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-secondary/10">
                              {match.compatibility_score}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            📍 {match.profile.location}
                          </p>
                          <p className="text-sm line-clamp-2">{match.profile.bio}</p>
                        </div>

                        <Button
                          onClick={() => handleOpenChat(match.matched_user_id, match.profile.first_name, match.profile.profile_photo_url)}
                          className="bg-gradient-to-r from-primary to-secondary"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                    <p className="text-muted-foreground">
                      All caught up! Your match requests will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={request.profile.profile_photo_url || undefined} />
                          <AvatarFallback className="text-2xl">
                            {request.profile.first_name[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-semibold">
                              {request.profile.first_name}, {request.profile.age}
                            </h3>
                            <Badge variant={request.type === 'received' ? 'default' : 'secondary'}>
                              {request.type === 'received' ? 'Received' : 'Sent'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            📍 {request.profile.location}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {request.type === 'received' ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAcceptRequest(request.id, request.sender_id)}
                              className="bg-gradient-to-r from-primary to-secondary"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest(request.id)}
                              variant="outline"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="px-4 py-2">
                            <Clock className="h-4 w-4 mr-2" />
                            Waiting for response
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Connections;
