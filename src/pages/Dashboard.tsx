import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingChatButton from "@/components/FloatingChatButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Heart, MessageCircle, Settings, TrendingUp, MapPin, UserCircle, Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatWindow from "@/components/ChatWindow";
import PhotoUpload from "@/components/PhotoUpload";
import { getPersonalityTraits } from "@/utils/matchingAlgorithm";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [interests, setInterests] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [analytics, setAnalytics] = useState({
    matchSuccessRate: 0,
    responseRate: 0,
    profileCompleteness: 0,
    totalMatches: 0,
    activeChats: 0,
    lastUpdated: new Date(),
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      loadProfile(session.user.id);
      calculateMatches(session.user.id);
      loadAnalytics(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Poll analytics every 10 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      loadAnalytics(user.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const loadProfile = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading profile:", profileError);
      } else {
        setProfile(profileData);
      }

      // Load interests
      const { data: interestsData, error: interestsError } = await supabase
        .from("interests")
        .select("*")
        .eq("user_id", userId);

      if (interestsError) {
        console.error("Error loading interests:", interestsError);
      } else {
        setInterests(interestsData || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatches = async (userId: string) => {
    setLoadingMatches(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-compatibility", {
        body: { userId },
      });

      if (error) throw error;
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error calculating matches:", error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadAnalytics = async (userId: string) => {
    try {
      // Get total matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('id')
        .eq('user_id', userId);

      // Get active conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      // Get total sent requests
      const { data: sentRequests } = await supabase
        .from('match_requests')
        .select('id, status')
        .eq('sender_id', userId);

      // Get profile data for completeness calculation
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, age, location, bio, profile_photo_url, tagline')
        .eq('user_id', userId)
        .single();

      const { data: media } = await supabase
        .from('user_media')
        .select('id')
        .eq('user_id', userId);

      // Get sent messages for response rate
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', userId);

      // Get received messages that are marked as read
      const { data: readMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', userId)
        .eq('read', true);

      // Calculate match success rate
      const totalRequests = sentRequests?.length || 0;
      const acceptedRequests = sentRequests?.filter(r => r.status === 'accepted').length || 0;
      const matchSuccessRate = totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0;

      // Calculate response rate
      const totalSentMessages = sentMessages?.length || 0;
      const totalReadMessages = readMessages?.length || 0;
      const responseRate = totalSentMessages > 0 ? Math.round((totalReadMessages / totalSentMessages) * 100) : 0;

      // Calculate profile completeness
      let completenessScore = 0;
      if (profileData) {
        if (profileData.first_name) completenessScore += 15;
        if (profileData.age) completenessScore += 15;
        if (profileData.location) completenessScore += 15;
        if (profileData.bio) completenessScore += 20;
        if (profileData.profile_photo_url) completenessScore += 25;
        if (profileData.tagline) completenessScore += 10;
      }
      if (media && media.length > 0) completenessScore = Math.min(100, completenessScore + (media.length * 5));

      setAnalytics({
        matchSuccessRate,
        responseRate,
        profileCompleteness: completenessScore,
        totalMatches: matchesData?.length || 0,
        activeChats: conversations?.length || 0,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const openChat = async (match: any) => {
    try {
      const [userId1, userId2] = [user.id, match.matched_user_id].sort();
      console.log("Opening chat. Resolving conversation for:", userId1, userId2);

      // Find existing conversation between these two users
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
        toast({ title: 'Error', description: 'Could not open chat.', variant: 'destructive' });
        return;
      }

      let conversationId = existing?.id as string | undefined;

      // Create conversation if it doesn't exist yet
      if (!conversationId) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({ user1_id: userId1, user2_id: userId2 })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          toast({ title: 'Error', description: 'Could not start a new conversation.', variant: 'destructive' });
          return;
        }

        conversationId = newConv?.id;
      }

      setSelectedChat({
        conversationId,
        otherUser: {
          id: match.matched_user_id,
          name: match.profile.first_name,
          avatar: match.profile.profile_photo_url,
        },
      });
      setChatOpen(true);
    } catch (e) {
      console.error('Unexpected error opening chat:', e);
      toast({ title: 'Error', description: 'Something went wrong opening the chat.', variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 px-4 py-8 mt-20">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={profile?.profile_photo_url} />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-secondary text-white">
                    {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    {profile?.first_name || "User"}
                  </h1>
                  <p className="text-muted-foreground mb-2">{profile?.tagline || profile?.bio || "Welcome to VibeLink!"}</p>
                  {profile?.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground justify-center md:justify-start">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                      {interests.map((interest) => (
                        <Badge key={interest.id} variant="secondary" className="bg-primary/20">
                          {interest.interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={() => navigate("/discover")}
              className="h-24 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              size="lg"
            >
              <div className="flex flex-col items-center gap-2">
                <Compass className="h-8 w-8" />
                <span className="text-lg font-semibold">Discover New People</span>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/requests")}
              className="h-24 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              size="lg"
            >
              <div className="flex flex-col items-center gap-2">
                <Heart className="h-8 w-8" />
                <span className="text-lg font-semibold">Match Requests</span>
              </div>
            </Button>
            <Button
              onClick={() => navigate(`/profile/${user?.id}`)}
              variant="outline"
              className="h-24"
              size="lg"
            >
              <div className="flex flex-col items-center gap-2">
                <UserCircle className="h-8 w-8" />
                <span className="text-lg font-semibold">My Profile Showcase</span>
              </div>
            </Button>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Matches
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Your Matches
                    </div>
                    <Button 
                      onClick={() => calculateMatches(user.id)}
                      disabled={loadingMatches}
                      variant="outline"
                      size="sm"
                    >
                      {loadingMatches ? "Loading..." : "Refresh Matches"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingMatches ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : matches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matches.map((match) => {
                        const traits = getPersonalityTraits(match.profile?.personality_answers);
                        return (
                        <Card key={match.matched_user_id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6 text-center">
                            {/* Personality-first: always show gradient avatar, no photo */}
                            <div className="h-20 w-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary via-secondary to-pink-400 flex items-center justify-center ring-4 ring-primary/20">
                              <span className="text-white text-2xl font-bold">
                                {match.profile.first_name[0]}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{match.profile.first_name}, {match.profile.age}</h3>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-primary/20 text-primary font-semibold">
                                {match.compatibility_score}% vibe match
                              </Badge>
                            </div>
                            {match.profile.location && (
                              <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {match.profile.location}
                              </p>
                            )}
                            {traits.length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-center mb-3">
                                {traits.map((trait: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs border-primary/40 text-primary">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            ) : match.profile.interests?.length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-center mb-3">
                                {match.profile.interests.slice(0, 3).map((interest: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-primary to-secondary"
                              onClick={() => openChat(match)}
                            >
                              Start Chatting
                            </Button>
                          </CardContent>
                        </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete your profile and add interests to find compatible matches!
                      </p>
                      <Button onClick={() => calculateMatches(user.id)}>
                        Find Matches
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Start a conversation with your matches!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <PhotoUpload
                        currentPhotoUrl={profile?.profile_photo_url}
                        userId={user.id}
                        onUploadComplete={(url) => setProfile({ ...profile, profile_photo_url: url })}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Profile Information</h3>
                      <div className="grid gap-3">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Name</span>
                          <span className="font-medium">{profile?.first_name}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Age</span>
                          <span className="font-medium">{profile?.age}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Gender</span>
                          <span className="font-medium capitalize">{profile?.gender}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Your Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Match Success Rate</span>
                        <span className="text-sm font-bold text-primary">{analytics.matchSuccessRate}%</span>
                      </div>
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/20">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${analytics.matchSuccessRate}%`,
                            background: 'linear-gradient(90deg, #FF4D6D, #5A189A)'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Response Rate</span>
                        <span className="text-sm font-bold text-primary">{analytics.responseRate}%</span>
                      </div>
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/20">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${analytics.responseRate}%`,
                            background: 'linear-gradient(90deg, #FF4D6D, #5A189A)'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Profile Completeness</span>
                        <span className="text-sm font-bold text-primary">{analytics.profileCompleteness}%</span>
                      </div>
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/20">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${analytics.profileCompleteness}%`,
                            background: 'linear-gradient(90deg, #FF4D6D, #5A189A)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                        <CardContent className="pt-6 text-center">
                          <p className="text-3xl font-bold text-primary animate-fade-in">{analytics.totalMatches}</p>
                          <p className="text-sm text-muted-foreground">Total Matches</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                        <CardContent className="pt-6 text-center">
                          <p className="text-3xl font-bold text-primary animate-fade-in">{analytics.activeChats}</p>
                          <p className="text-sm text-muted-foreground">Active Chats</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 p-3 bg-muted/50 rounded-lg text-center text-xs text-muted-foreground space-y-1">
                      <p className="font-medium flex items-center justify-center gap-2">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        Real-Time Analytics
                      </p>
                      <p className="text-[10px]">
                        Last updated: {analytics.lastUpdated.toLocaleTimeString()} • Auto-refreshes every 10s
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {chatOpen && selectedChat && (
        <ChatWindow
          conversationId={selectedChat.conversationId}
          otherUser={selectedChat.otherUser}
          currentUserId={user.id}
          onClose={() => setChatOpen(false)}
        />
      )}

      <FloatingChatButton
        onOpenChat={(conversation) => {
          setSelectedChat({
            conversationId: conversation.id,
            otherUser: {
              id: conversation.id,
              name: conversation.name,
              avatar: conversation.avatar,
            },
          });
          setChatOpen(true);
        }}
        conversations={matches.slice(0, 5).map((match) => ({
          id: match.matched_user_id,
          name: match.profile.first_name,
          avatar: match.profile.profile_photo_url,
          lastMessage: "Start a conversation...",
          unreadCount: 0,
        }))}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
