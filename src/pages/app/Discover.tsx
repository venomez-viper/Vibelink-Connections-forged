import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Bookmark, Plus, Sparkles, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/app/AppHeader";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleSendVibe = async () => {
    if (currentIndex >= profiles.length || sending) return;
    
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
        description: error.message || "Failed to send vibe",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Vibe Sent! 💫",
        description: `You sent a match request to ${currentProfile.first_name}`,
      });
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background app-theme font-body">
        <AppHeader />
        <main className="container mx-auto px-4 md:px-8 py-12 pb-[80px]">
          <Skeleton className="w-64 h-8 mb-2 bg-surface-container border-0" />
          <Skeleton className="w-96 h-12 mb-12 bg-surface-container border-0" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex gap-8 bg-surface-container rounded-[32px] p-8 h-[500px] border-0">
              <Skeleton className="w-1/2 h-full rounded-2xl bg-surface-container-high border-0" />
              <div className="w-1/2 flex flex-col gap-4">
                <Skeleton className="w-48 h-10 bg-surface-container-high border-0" />
                <Skeleton className="w-full h-24 bg-surface-container-high border-0" />
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-4 border-0">
              <Skeleton className="w-full h-32 rounded-2xl bg-surface-container border-0" />
              <Skeleton className="w-full h-32 rounded-2xl bg-surface-container border-0" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  // Next 3 profiles in the queue
  const queueProfiles = profiles.slice(currentIndex + 1, currentIndex + 4);

  return (
    <div className="min-h-screen app-theme bg-background font-body text-white selection:bg-primary/30">
      <AppHeader />

      <main className="container mx-auto px-4 md:px-8 pt-6 pb-24">
        
        {/* Title Section */}
        <div className="mb-10">
          <h3 className="font-freestyle text-[#FF4D6D] text-3xl md:text-4xl mb-2 drop-shadow-sm">Curated for your soul</h3>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight">
            Discover <span className="text-primary">Synchronicity</span>
          </h1>
        </div>

        {currentProfile ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Main Featured Profile */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProfile.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="lg:col-span-8 bg-surface-container rounded-[40px] p-6 lg:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden ghost-border"
              >
                {/* Left side: Photo & Score */}
                <div className="w-full md:w-[45%] relative aspect-[3/4] md:aspect-auto md:h-[480px] rounded-3xl overflow-hidden shadow-ambient group">
                  <img
                    src={currentProfile.profile_photo_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"}
                    alt={currentProfile.first_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-between p-6">
                    <div className="flex justify-center flex-1 items-center">
                      <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-2xl">
                        <span className="text-3xl lg:text-4xl font-bold text-white tracking-tighter">
                          {currentProfile.compatibility_score || 94}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-freestyle text-2xl text-white/90">The Architect</h4>
                      <p className="text-[10px] tracking-[0.2em] font-bold text-white/50 uppercase">Personality Archetype</p>
                    </div>
                  </div>
                </div>

                {/* Right side: Details */}
                <div className="w-full md:w-[55%] flex flex-col justify-center py-4 pr-4">
                  <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-6">
                    {currentProfile.first_name}, {currentProfile.age}
                  </h2>
                  
                  {/* Mocked/Derived Tags mapped to UI */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-xs font-semibold text-slate-200 ghost-border">
                      Both Introverted
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-xs font-semibold text-slate-200 ghost-border">
                      Night Owls
                    </span>
                    {currentProfile.location && (
                      <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-xs font-semibold text-slate-200 ghost-border truncate max-w-[150px]">
                        {currentProfile.location}
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm lg:text-base leading-relaxed mb-8 flex-1">
                    {currentProfile.bio || "Seeking the kind of connection that exists in the spaces between words. I find peace in rainy Tuesday afternoons and high-fidelity soundscapes."}
                  </p>

                  <div className="flex gap-4 items-center">
                    <Button 
                      onClick={handleSendVibe}
                      disabled={sending}
                      className="flex-1 rounded-full bg-gradient-to-r from-primary to-[#ff7b93] hover:from-[#ff3a5ebf] hover:to-[#ff7b93] text-white py-6 text-base font-bold shadow-ambient transition-all hover:scale-[1.02] active:scale-95 border-none"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Vibe"}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-14 h-14 rounded-full bg-surface-container-high hover:bg-surface-container-highest border-white/5 text-white shrink-0 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Bookmark className="w-5 h-5 fill-white/20" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Queue Side (Right Sidebar) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {queueProfiles.map((qp, idx) => (
                <div 
                  key={qp.user_id} 
                  className="bg-surface-container rounded-3xl p-5 md:p-6 cursor-pointer hover:bg-surface-container-high transition-colors ghost-border flex items-center justify-between group"
                  onClick={() => setCurrentIndex(currentIndex + 1 + idx)}
                >
                  <div className="flex gap-4 items-center w-full">
                    {/* Small Avatar bubble */}
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/10 relative">
                       <img src={qp.profile_photo_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`} alt={qp.first_name} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-lg lg:text-xl truncate text-white">
                          {qp.first_name}, {qp.age}
                        </h3>
                        {/* Fake derived scores descending */}
                        <div className="text-right shrink-0 ml-2">
                           <span className="text-lg lg:text-xl font-bold block leading-none text-white">{qp.compatibility_score || 88 - (idx * 6)}%</span>
                           <span className="text-[8px] uppercase tracking-wider text-white/40 block mt-1">Compatibility</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic font-medium truncate">
                        "{qp.tagline || 'Similar Life Goals & Shared Values'}"
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors ml-2 shrink-0" />
                </div>
              ))}

              {/* Refine Your Vibe button */}
              {queueProfiles.length > 0 && (
                <button 
                  className="w-full mt-2 rounded-[32px] border-2 border-dashed border-surface-variant hover:border-primary/50 bg-transparent hover:bg-surface-container p-6 flex flex-col items-center justify-center gap-2 transition-all group"
                  onClick={() => navigate('/dashboard')}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs tracking-widest uppercase font-bold text-muted-foreground group-hover:text-white transition-colors">
                    Refine Your Vibe
                  </span>
                </button>
              )}
            </div>

          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto mt-20 text-center">
            <div className="bg-surface-container rounded-[40px] p-12 ghost-border shadow-ambient">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-8 relative">
                 <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                 <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold font-display mb-4">You're All Caught Up</h2>
              <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto">
                The universe is still orchestrating your next great connections. Check back later to discover new souls.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="rounded-full px-8 py-6 text-base font-bold bg-white text-[#200e14] hover:bg-white/90"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Footer Info Section (A Note on Compatibility) */}
        {currentProfile && (
          <div className="mt-20 lg:mt-32 max-w-5xl">
             <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                   <h4 className="font-freestyle text-primary/80 text-2xl mb-2">A Note on Compatibility</h4>
                   <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">Why Vibelink hides the visual.</h2>
                   <p className="text-muted-foreground text-sm lg:text-base leading-relaxed mb-8 max-w-lg">
                     Connections built on shared values and personality archetypes last 3x longer than those built on visual first impressions. We prioritize your essence, revealing the person behind the vibe only when the spark is mutual.
                   </p>
                   <Button variant="outline" className="rounded-full border-white/20 hover:bg-white/10 text-white ghost-border">
                     Learn about Soul-Mapping
                   </Button>
                </div>
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full bg-surface-container shrink-0 flex items-center justify-center relative ghost-border shadow-ambient mx-auto md:mx-0">
                   <Sparkles className="w-12 h-12 text-primary/40" />
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Discover;
