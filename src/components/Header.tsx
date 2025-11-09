import { Button } from "@/components/ui/button";
import logo from "@/assets/vibelink-logo-new.png";
const Header = () => {
  return <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between rounded-md mx-[5px] my-0 px-[3px] py-0">
          {/* Logo */}
          <div className="flex items-center -space-x-3">
            <img src={logo} alt="VibeLink Logo" className="w-24 h-24" />
            <span className="font-freestyle text-white text-5xl leading-none -ml-1">VibeLink</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white hover:text-accent transition-colors font-medium">
              How It Works
            </a>
            <a href="#" className="text-white hover:text-accent transition-colors font-medium">
              Safety
            </a>
            <a href="#" className="text-white hover:text-accent transition-colors font-medium">
              About
            </a>
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:text-accent hover:bg-white/10">
              Login
            </Button>
            <Button variant="hero" size="default">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;