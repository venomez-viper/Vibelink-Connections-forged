import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, LogIn } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/vibelink-logo-new.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppHeader = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('profile_photo_url, first_name')
      .eq('user_id', userId)
      .single();
    if (data) setUserProfile(data);
  };

  const NavLink = ({ to, label }: { to: string, label: string }) => {
    // Exact match for highlighted tab
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`px-1 py-1 text-sm font-medium transition-colors ${
          isActive 
            ? 'text-primary border-b-2 border-primary' 
            : 'text-muted-foreground hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className={`relative z-50 w-full ${isHomepage ? 'bg-transparent absolute top-0' : 'app-theme bg-surface border-b border-surface-variant'}`}>
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo (App vs Marketing) */}
        <Link to={isAuthenticated ? "/discover" : "/"} className={`flex items-center ${isAuthenticated ? '' : '-space-x-2 sm:-space-x-3 group'}`}>
          {isAuthenticated ? (
            <span className="font-freestyle text-primary text-3xl leading-none tracking-wider">
              Vibelink
            </span>
          ) : (
            <>
              <img src={logo} alt="VibeLink Logo" className="w-16 h-16 sm:w-20 sm:h-20 transition-transform group-hover:scale-105" />
              <span className="font-freestyle text-white text-2xl sm:text-3xl leading-none -ml-1 hover-glow drop-shadow-lg">
                VibeLink
              </span>
            </>
          )}
        </Link>
        
        {/* Center: App Navigation (Only shown when logged in or not on marketing pages) */}
        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <NavLink to="/discover" label="Discover" />
              <NavLink to="/requests" label="Journey" />
              <NavLink to="/messages" label="Vibe Room" />
              <NavLink to="/dashboard" label="Profile" />
            </>
          ) : (
            <>
              <Link to="/how-it-works" className="text-white hover:text-white/80 transition-colors font-medium text-base">How It Works</Link>
              <Link to="/safety" className="text-white hover:text-white/80 transition-colors font-medium text-base">Safety</Link>
              <Link to="/about" className="text-white hover:text-white/80 transition-colors font-medium text-base">About</Link>
            </>
          )}
        </nav>

        {/* Right: Auth / User Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/settings" className="text-muted-foreground hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/50 transition-all cursor-pointer">
                    <AvatarImage src={userProfile?.profile_photo_url} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {userProfile?.first_name?.[0] || 'V'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-surface-container border-surface-variant text-white">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full hover:bg-white/5">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/connections" className="cursor-pointer w-full hover:bg-white/5">Connections</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analytics" className="cursor-pointer w-full hover:bg-white/5">Analytics</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                    className="text-red-400 cursor-pointer focus:bg-red-400/10 focus:text-red-400 mt-2"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-white hover:text-white/80">Log In</Link>
              <Link to="/signup" className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default AppHeader;