import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-couple.png";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-32 md:pt-20" style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF758C)' }}>
      {/* Background gradient is now on the section itself */}
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Heart className="w-16 h-16 text-white animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <Heart className="w-20 h-20 text-white animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="text-white space-y-6 text-center md:text-left">
            <Link to="/nearby-matches" className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4 text-white hover:bg-white/20 transition-colors">
              Connect with Nearby Singles 📍
            </Link>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-white">
              Welcome to <span className="font-freestyle italic text-white">VibeLink</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl max-w-xl mx-auto md:mx-0" style={{ color: '#FFECEC' }}>
              Meet like-minded singles nearby—safe, genuine, and designed for meaningful connections. 
              Find love, friendship, or your soulmate in a vibrant community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start pt-4">
              <Button 
                size="lg" 
                asChild 
                className="bg-white hover:bg-white/90 rounded-full font-semibold min-h-[44px] px-8"
                style={{ color: '#FF4D6D' }}
              >
                <Link to="/signup">Sign Up Free</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 rounded-full min-h-[44px] px-8 bg-transparent" 
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-8 pt-8 text-sm text-white">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">100K+</div>
                <div className="text-white/80 text-xs sm:text-sm">Active Users</div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">50K+</div>
                <div className="text-white/80 text-xs sm:text-sm">Matches Made</div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">4.8★</div>
                <div className="text-white/80 text-xs sm:text-sm">User Rating</div>
              </div>
            </div>
          </div>
          
          {/* Right column - Image */}
          <div className="relative hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <img 
                src={heroImage} 
                alt="Happy couple connecting through VibeLink" 
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave decoration at bottom - smooth wave transition */}
      <div className="absolute bottom-0 left-0 right-0 leading-[0] border-none outline-none -mb-px">
        <svg 
          viewBox="0 0 1440 320" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full block border-none outline-none h-[80px] md:h-[120px]" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
            fill="hsl(var(--background))" 
            stroke="none" 
            strokeWidth="0"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
