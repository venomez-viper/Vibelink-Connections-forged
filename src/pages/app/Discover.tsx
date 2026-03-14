import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, X, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/website/Footer";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";

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
  const controls = useAnimation();

  // Motion values for swipe tracking
  const x = useMotionValue(0);
  // Rotation tied to how far you drag X
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  // Opacity for the overlays (LIKE/NOPE) depending on drag direction
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);

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

  const executeAction = async (direction: 'left' | 'right') => {
    if (currentIndex >= profiles.length || sending) return;

    if (direction === 'left') {
      setCurrentIndex(prev => prev + 1);
      x.set(0); // reset motion
    } else {
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
        // Put card back to center since we failed
        controls.start({ x: 0, rotate: 0, transition: { type: 'spring', duration: 0.5 } });
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
        controls.start({ x: 0, rotate: 0, transition: { type: 'spring', duration: 0.5 } });
      } else {
        toast({
          title: "Request Sent! ❤️",
          description: `You sent a match request to ${currentProfile.first_name}`,
        });
        setCurrentIndex(prev => prev + 1);
        x.set(0); // reset motion
      }
      setSending(false);
    }
  };

  // Logic triggered when the user lets go of a card they dragged
  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100; // Drag far enough to count as a swipe
    const velocityThreshold = 500; // Flick fast enough to count as a swipe

    // Swipe Right
    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      await controls.start({ x: window.innerWidth, transition: { duration: 0.2 } });
      executeAction('right');
    }
    // Swipe Left
    else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      await controls.start({ x: -window.innerWidth, transition: { duration: 0.2 } });
      executeAction('left');
    }
    // Snap back
    else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  // Button handlers that trigger the anim programmatic
  const handlePassBtn = async () => {
    if (sending || currentIndex >= profiles.length) return;
    await controls.start({ x: -window.innerWidth, rotate: -15, transition: { duration: 0.3 } });
    executeAction('left');
  };

  const handleSendRequestBtn = async () => {
    if (sending || currentIndex >= profiles.length) return;
    await controls.start({ x: window.innerWidth, rotate: 15, transition: { duration: 0.3 } });
    executeAction('right');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 overflow-hidden">
        <Header />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col relative z-10 pt-24 pb-[80px]">
          <div className="relative flex-1 flex items-center justify-center w-full">
            <div className="absolute w-full h-[65vh] sm:max-h-[550px]" style={{ zIndex: 3 }}>
              <Skeleton className="w-full h-full rounded-2xl bg-slate-900/80 shadow-2xl" />
            </div>
            <div className="absolute w-full h-[65vh] sm:max-h-[550px]" style={{ transform: 'scale(0.95) translateY(15px) rotate(-2deg)', zIndex: 2 }}>
              <Skeleton className="w-full h-full rounded-2xl bg-slate-800/50" />
            </div>
            <div className="absolute w-full h-[65vh] sm:max-h-[550px]" style={{ transform: 'scale(0.9) translateY(30px) rotate(2deg)', zIndex: 1 }}>
              <Skeleton className="w-full h-full rounded-2xl bg-slate-800/30" />
            </div>
          </div>
          <div className="flex gap-6 justify-center mt-8 items-center h-[80px]">
            <Skeleton className="w-16 h-16 rounded-full bg-slate-800" />
            <Skeleton className="w-20 h-20 rounded-full bg-slate-800" />
          </div>
        </main>
      </div>
    );
  }

  // To create the 'deck' effect, grab the next 3 profiles.
  const cardsToRender = profiles.slice(currentIndex, currentIndex + 3).reverse();

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <div className="shrink-0 z-50">
        <Header />
      </div>

      <main className="flex-1 max-w-md w-full mx-auto px-4 flex flex-col relative z-10 pt-4 pb-8 overflow-hidden">
        {/* Title removed to maximize swipe area for standard dating app feel */}

        <div className="flex-1 w-full relative">
          {cardsToRender.length > 0 ? (
            cardsToRender.map((profile, arrayIndex) => {
              // Reversed array means arrayIndex 0 is actually the furthest card back.
              // So active card is arrayIndex === cardsToRender.length - 1
              const isActiveCard = arrayIndex === cardsToRender.length - 1;
              const depthIndex = cardsToRender.length - 1 - arrayIndex;

              return (
                <motion.div
                  key={profile.user_id}
                  className="absolute inset-0 pb-4" // pb-4 adds a little breathing room at the bottom of the container
                  style={{
                    x: isActiveCard ? x : 0,
                    rotate: isActiveCard ? rotate : depthIndex === 1 ? -2 : 2,
                    scale: isActiveCard ? 1 : 1 - (depthIndex * 0.05),
                    y: isActiveCard ? 0 : depthIndex * 15, // stack slightly downward
                    zIndex: cardsToRender.length - depthIndex,
                    cursor: isActiveCard ? 'grab' : 'auto'
                  }}
                  drag={isActiveCard && !sending ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }} // Causes the spring-back feel
                  dragElastic={0.8} // Allows it to be dragged far past 0
                  onDragEnd={isActiveCard ? handleDragEnd : undefined}
                  animate={isActiveCard ? controls : undefined}
                  whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
                >
                  <Card className="w-full h-full overflow-hidden shadow-2xl rounded-2xl relative bg-slate-900 border-none select-none">

                    {/* The Background Photo */}
                    <div className="absolute inset-0 bg-black pointer-events-none">
                      <img
                        src={profile.profile_photo_url || "https://via.placeholder.com/400"}
                        alt={profile.first_name}
                        className="w-full h-full object-cover"
                        draggable="false"
                      />
                    </div>

                    {/* Like / Nope Overlay Text */}
                    {isActiveCard && (
                      <>
                        <motion.div
                          className="absolute top-10 right-10 z-20 pointer-events-none"
                          style={{ opacity: nopeOpacity }}
                        >
                          <div className="border-4 border-red-500 text-red-500 text-4xl font-bold uppercase py-1 px-4 rounded-xl transform rotate-12">
                            Nope
                          </div>
                        </motion.div>

                        <motion.div
                          className="absolute top-10 left-10 z-20 pointer-events-none"
                          style={{ opacity: likeOpacity }}
                        >
                          <div className="border-4 border-green-500 text-green-500 text-4xl font-bold uppercase py-1 px-4 rounded-xl transform -rotate-12">
                            Like
                          </div>
                        </motion.div>
                      </>
                    )}

                    {/* Gradient to make text readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                    {/* Profile Information (Bottom text) */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                      <h2 className="text-3xl sm:text-4xl font-bold mb-1 drop-shadow-md truncate">
                        {profile.first_name}, {profile.age}
                      </h2>

                      <div className="flex flex-col gap-1 sm:gap-2 mt-2">
                        {profile.location && (
                          <div className="flex items-center gap-2 text-slate-200">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 opacity-80 shrink-0" />
                            <span className="text-base sm:text-lg truncate">{profile.location}</span>
                          </div>
                        )}

                        {profile.tagline && (
                          <div className="text-base sm:text-lg italic text-slate-300 font-medium line-clamp-1">"{profile.tagline}"</div>
                        )}

                        {profile.bio && (
                          <p className="text-slate-300 mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm">
                            {profile.bio}
                          </p>
                        )}
                      </div>

                      {profile.compatibility_score && (
                        <div className="mt-3 sm:mt-4 inline-block bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-white/30">
                          {profile.compatibility_score}% Vibe Match
                        </div>
                      )}
                    </div>

                  </Card>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full h-full flex items-center justify-center"
            >
              <Card className="w-full p-8 sm:p-12 text-center bg-slate-900 border-slate-800 text-white rounded-2xl shadow-xl">
                <div className="bg-slate-800/50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">You're All Caught Up</h2>
                <p className="text-slate-400 mb-8 text-base sm:text-lg">
                  There's no one new around you.<br />Check back later!
                </p>
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white border-0"
                >
                  Back to Dashboard
                </Button>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Swipe Action Buttons */}
        {cardsToRender.length > 0 && (
          <div className="shrink-0 flex gap-6 justify-center items-center mt-4">
            <Button
              size="icon"
              variant="outline"
              onClick={handlePassBtn}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400 bg-slate-900/50 backdrop-blur-md transition-transform active:scale-95 z-20"
            >
              <X className="h-6 w-6 sm:h-8 sm:w-8" />
            </Button>

            <Button
              size="icon"
              onClick={handleSendRequestBtn}
              disabled={sending}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full text-white bg-gradient-to-tr from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-transform active:scale-95 border-0 z-20"
            >
              {sending ? (
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
              ) : (
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 fill-white" />
              )}
            </Button>
          </div>
        )}
      </main>

      {/* <Footer /> - Omit or hide footer on discover for cleaner swipe UI? We can keep it or let it scroll down naturally */}
    </div>
  );
};

export default Discover;
