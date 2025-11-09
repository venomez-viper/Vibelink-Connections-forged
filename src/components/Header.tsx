import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/vibelink-logo-new.png";

const Header = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  
  return (
    <header className={`absolute top-0 left-0 right-0 z-50 ${isHomepage ? 'bg-transparent' : 'bg-primary'}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between rounded-md mx-[5px] my-0 px-[3px] py-0">
          {/* Logo */}
          <Link to="/" className="flex items-center -space-x-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="VibeLink Logo" className="w-24 h-24" />
            <span className="font-freestyle text-white text-5xl leading-none -ml-1">VibeLink</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/how-it-works" className="text-white hover:text-accent transition-colors font-medium">
              How It Works
            </Link>
            <Link to="/safety" className="text-white hover:text-accent transition-colors font-medium">
              Safety
            </Link>
            <Link to="/about" className="text-white hover:text-accent transition-colors font-medium">
              About
            </Link>
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:text-accent hover:bg-white/10" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button variant="hero" size="default" asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Wavy Bottom Border - Only show on non-homepage */}
      {!isHomepage && (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform translate-y-full">
          <svg className="relative block w-full h-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="hsl(var(--background))" 
              fillOpacity="1"
              d="M0,128L80,144C160,160,320,192,480,181.3C640,171,800,117,960,101.3C1120,85,1280,107,1360,117.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </div>
      )}
    </header>
  );
};
export default Header;