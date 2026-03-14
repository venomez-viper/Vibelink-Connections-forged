import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, MessageCircle, Clock, TrendingUp } from "lucide-react";
import Header from "@/components/Header";

interface AnalyticsData {
  matchSuccessRate: number;
  responseRate: number;
  profileCompleteness: number;
  totalMatches: number;
  activeChats: number;
  pendingRequests: number;
  lastUpdated?: Date;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    matchSuccessRate: 0,
    responseRate: 0,
    profileCompleteness: 0,
    totalMatches: 0,
    activeChats: 0,
    pendingRequests: 0,
    lastUpdated: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadAnalytics();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      loadAnalytics();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkAuthAndLoadAnalytics = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    await loadAnalytics();
    setLoading(false);
  };

  const loadAnalytics = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    // Get total matches
    const { data: matches } = await supabase
      .from('matches')
      .select('id')
      .eq('user_id', userId);

    // Get active conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    // Get pending requests (both sent and received)
    const { data: pendingRequests } = await supabase
      .from('match_requests')
      .select('id')
      .eq('status', 'pending')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    // Get total sent requests
    const { data: sentRequests } = await supabase
      .from('match_requests')
      .select('id, status')
      .eq('sender_id', userId);

    // Get profile data for completeness calculation
    const { data: profile } = await supabase
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
    if (profile) {
      if (profile.first_name) completenessScore += 15;
      if (profile.age) completenessScore += 15;
      if (profile.location) completenessScore += 15;
      if (profile.bio) completenessScore += 20;
      if (profile.profile_photo_url) completenessScore += 25;
      if (profile.tagline) completenessScore += 10;
    }
    if (media && media.length > 0) completenessScore = Math.min(100, completenessScore + (media.length * 5));

    setAnalytics({
      matchSuccessRate,
      responseRate,
      profileCompleteness: completenessScore,
      totalMatches: matches?.length || 0,
      activeChats: conversations?.length || 0,
      pendingRequests: pendingRequests?.length || 0,
      lastUpdated: new Date(),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-romantic-50 via-white to-romantic-100">
        <Header />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-romantic-50 via-white to-romantic-100">
      <Header />
      
      <main className="container mx-auto px-4 pt-12 pb-24" style={{ marginTop: '0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-freestyle text-gradient-brand mb-4">
              Your Analytics
            </h1>
            <p className="text-muted-foreground">
              Track your VibeLink journey in real-time
            </p>
          </div>

          {/* Progress Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Match Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-bold text-lg text-primary">{analytics.matchSuccessRate}%</span>
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
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-bold text-lg text-primary">{analytics.responseRate}%</span>
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
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Profile Completeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Completeness</span>
                    <span className="font-bold text-lg text-primary">{analytics.profileCompleteness}%</span>
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
              </CardContent>
            </Card>
          </div>

          {/* Live Counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-3xl font-bold">{analytics.totalMatches}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <MessageCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Chats</p>
                    <p className="text-3xl font-bold">{analytics.activeChats}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="text-3xl font-bold">{analytics.pendingRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground space-y-1">
            <p className="font-medium">📊 Real-Time Analytics</p>
            <p className="text-xs">
              Last updated: {analytics.lastUpdated ? new Date(analytics.lastUpdated).toLocaleTimeString() : 'Never'} • 
              Auto-refreshes every 10 seconds
            </p>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Analytics;
