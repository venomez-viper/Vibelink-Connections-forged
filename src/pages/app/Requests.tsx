import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/website/Footer";

interface MatchRequest {
  id: string;
  sender_id: string;
  status: string;
  created_at: string;
  sender: {
    first_name: string;
    age: number;
    location: string;
    bio: string;
    profile_photo_url: string;
  };
}

const Requests = () => {
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadRequests();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("match_requests")
        .select(`
          id,
          sender_id,
          status,
          created_at
        `)
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch sender profiles
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, age, location, bio, profile_photo_url")
            .eq("user_id", request.sender_id)
            .maybeSingle();

          return {
            ...request,
            sender: profile || {
              first_name: "Unknown",
              age: 0,
              location: "Unknown",
              bio: "",
              profile_photo_url: "",
            },
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string, senderId: string) => {
    setProcessing(requestId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update request status
      const { error: updateError } = await supabase
        .from("match_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Create mutual matches
      const { error: match1Error } = await supabase
        .from("matches")
        .insert({
          user_id: user.id,
          matched_user_id: senderId,
          compatibility_score: 75, // Default score
        });

      const { error: match2Error } = await supabase
        .from("matches")
        .insert({
          user_id: senderId,
          matched_user_id: user.id,
          compatibility_score: 75,
        });

      if (match1Error || match2Error) throw match1Error || match2Error;

      toast({
        title: "Match Created! 💕",
        description: "You can now chat with your new match",
      });

      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from("match_requests")
        .update({ status: "declined" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request Declined",
        description: "The request has been declined",
      });

      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error("Error declining request:", error);
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gradient-brand">
          Match Requests
        </h1>

        {requests.length === 0 ? (
          <Card className="max-w-md mx-auto p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No Pending Requests</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any pending match requests at the moment.
            </p>
            <Button onClick={() => navigate("/discover")}>
              Discover New People
            </Button>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden hover-scale">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
                      <AvatarImage src={request.sender.profile_photo_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
                        {request.sender.first_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {request.sender.first_name}, {request.sender.age}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.sender.location}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6">
                    {request.sender.bio || "No bio available"}
                  </p>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 hover:border-red-500 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDecline(request.id)}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Decline
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      onClick={() => handleAccept(request.id, request.sender_id)}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Requests;
