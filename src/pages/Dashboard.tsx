import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Heart, MessageCircle, Settings, TrendingUp, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Your Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="pt-6 text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-3">
                            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xl">
                              M{i}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-lg mb-1">Match {i}</h3>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-primary/20">
                              {85 + i}% Compatible
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Shared interests: Music, Travel
                          </p>
                          <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary">
                            View Profile
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <p className="text-muted-foreground text-sm">
                      More matches coming soon! Keep your profile updated.
                    </p>
                  </div>
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
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Profile Information</h3>
                      <div className="grid gap-3">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Name</span>
                          <span className="font-medium">{profile?.first_name}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="font-medium">{profile?.email}</span>
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
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Match Success Rate</span>
                        <span className="text-sm font-bold text-primary">78%</span>
                      </div>
                      <Progress value={78} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Response Rate</span>
                        <span className="text-sm font-bold text-primary">65%</span>
                      </div>
                      <Progress value={65} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Profile Completeness</span>
                        <span className="text-sm font-bold text-primary">85%</span>
                      </div>
                      <Progress value={85} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                        <CardContent className="pt-6 text-center">
                          <p className="text-3xl font-bold text-primary">12</p>
                          <p className="text-sm text-muted-foreground">Total Matches</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                        <CardContent className="pt-6 text-center">
                          <p className="text-3xl font-bold text-primary">8</p>
                          <p className="text-sm text-muted-foreground">Active Chats</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
