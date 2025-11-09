import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/vibelink-logo-new.png";
const Header = () => {
  return <header className="absolute top-0 left-0 right-0 z-50 bg-primary">
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
      {/* Wavy Bottom Border */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform translate-y-full">
        <svg className="relative block w-full h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
        </svg>
      </div>
    </header>;
};
export default Header;