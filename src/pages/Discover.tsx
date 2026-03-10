import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, X, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  location: string;
  bio: string;
  profile_photo_url: string;
  tagline: string;
  compatibility_score?: number;
}

const Discover = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadProfiles();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: matchesData } = await supabase
        .from("matches")
        .select("matched_user_id")
        .eq("user_id", user.id);

      const matchedUserIds = matchesData?.map((m) => m.matched_user_id) || [];

      const { data: requestsData } = await supabase
        .from("match_requests")
        .select("receiver_id")
        .eq("sender_id", user.id);

      const requestedUserIds = requestsData?.map((r) => r.receiver_id) || [];

      const excludeIds = [...matchedUserIds, ...requestedUserIds, user.id];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .not("user_id", "in", `(${excludeIds.join(",")})`)
        .limit(20);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (currentIndex >= profiles.length) return;

    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      return;
    }

    const currentProfile = profiles[currentIndex];

    // Check rate limit: 10 pending requests per hour
    const { count, error: countError } = await supabase
      .from('match_requests')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', user.id)
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    if (countError) {
      console.error("Error checking rate limit:", countError);
    } else if (count && count >= 10) {
      toast({
        title: "Limit Reached",
        description: "You can send 10 match requests per hour. Please wait before sending more.",
        variant: "destructive",
      });
      setSending(false);
      return;
    }

    const { error } = await supabase.from("match_requests").insert({
      sender_id: user.id,
      receiver_id: currentProfile.user_id,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Sent! ❤️",
        description: `You sent a match request to ${currentProfile.first_name}`,
      });
      setCurrentIndex(currentIndex + 1);
    }
    setSending(false);
  };

  const handlePass = () => {
    setCurrentIndex(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-red-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 to-red-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gradient-brand">
          Discover New Connections
        </h1>

        {currentProfile ? (
          <div className="max-w-md mx-auto">
            <Card className="overflow-hidden shadow-2xl">
              <div className="relative h-[500px]">
                <img
                  src={currentProfile.profile_photo_url || "https://via.placeholder.com/400"}
                  alt={currentProfile.first_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <h2 className="text-3xl font-bold mb-1">
                    {currentProfile.first_name}, {currentProfile.age}
                  </h2>
                  {currentProfile.location && (
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{currentProfile.location}</span>
                    </div>
                  )}
                  {currentProfile.tagline && (
                    <p className="text-sm italic mb-2">&quot;{currentProfile.tagline}&quot;</p>
                  )}
                  {currentProfile.compatibility_score && (
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      {currentProfile.compatibility_score}% Match
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">
                  {currentProfile.bio || "No bio yet"}
                </p>

                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handlePass}
                    className="w-20 h-20 rounded-full border-2 hover:border-red-500 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="h-8 w-8" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSendRequest}
                    disabled={sending}
                    className="w-20 h-20 rounded-full text-white" style={{ background: '#C1003A' }}
                  >
                    {sending ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Heart className="h-8 w-8" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No More Profiles</h2>
            <p className="text-muted-foreground mb-6">
              You've seen all available profiles for now. Check back later!
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Discover;
