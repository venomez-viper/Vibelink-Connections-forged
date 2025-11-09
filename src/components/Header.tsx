import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, User, BarChart3, Settings } from "lucide-react";
import logo from "@/assets/vibelink-logo-new.png";

const Header = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <header className={`${isHomepage ? 'absolute' : 'relative'} top-0 left-0 right-0 z-50 ${isHomepage ? 'bg-transparent' : 'bg-primary'} overflow-hidden`}>
      <div className="container mx-auto px-4 md:px-[60px] py-5">
        <div className="flex items-center justify-between rounded-md mx-[5px] my-0 px-[3px] py-0">
          {/* Logo */}
          <Link to="/" className="flex items-center -space-x-3 group">
            <img src={logo} alt="VibeLink Logo" className="w-24 h-24 transition-transform group-hover:scale-105" />
            <span className="font-freestyle text-white text-5xl leading-none -ml-1 hover-glow drop-shadow-lg">
              VibeLink
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              // Logged in navigation
              <>
                <Link 
                  to="/discover" 
                  className="flex items-center gap-2 text-white hover:text-accent transition-colors font-medium"
                >
                  <Heart className="h-5 w-5" />
                  <span>Discover</span>
                </Link>
                <Link 
                  to="/connections" 
                  className="flex items-center gap-2 text-white hover:text-accent transition-colors font-medium"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Connections</span>
                </Link>
                <Link 
                  to="/profile-showcase" 
                  className="flex items-center gap-2 text-white hover:text-accent transition-colors font-medium"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 text-white hover:text-accent transition-colors font-medium"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </>
            ) : (
              // Logged out navigation
              <>
                <Link to="/how-it-works" className="text-white hover:text-accent transition-colors font-medium">
                  How It Works
                </Link>
                <Link to="/safety" className="text-white hover:text-accent transition-colors font-medium">
                  Safety
                </Link>
                <Link to="/about" className="text-white hover:text-accent transition-colors font-medium">
                  About
                </Link>
              </>
            )}
          </nav>
          
          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              // Logged in - show settings button and logout
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-accent hover:bg-white/10"
                  asChild
                >
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </Button>
                <Button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full font-semibold px-5"
                >
                  Logout
                </Button>
              </>
            ) : (
              // Logged out - show login and signup
              <>
                <Button variant="ghost" className="text-white hover:text-accent hover:bg-white/10" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-white text-primary hover:bg-white/90 rounded-full font-semibold px-5" size="default" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Wavy Bottom Border - Only show on non-homepage */}
      {!isHomepage && (
        <div className="absolute -bottom-[1px] left-0 w-full overflow-hidden leading-[0] border-none outline-none shadow-none">
          <svg className="block w-full h-[60px] border-none outline-none shadow-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="hsl(var(--background))" 
              fillOpacity="1"
              stroke="none"
              d="M0,128L80,144C160,160,320,192,480,181.3C640,171,800,117,960,101.3C1120,85,1280,107,1360,117.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </div>
      )}
    </header>
  );
};
export default Header;