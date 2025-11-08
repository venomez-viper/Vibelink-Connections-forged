import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-couple.png";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary" />
      
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
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4 text-white">
              Connect with Nearby Singles 📍
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
              Welcome to <span className="text-white">VibeLink</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white max-w-xl">
              Meet like-minded singles nearby—safe, genuine, and designed for meaningful connections. 
              Find love, friendship, or your soulmate in a vibrant community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Button size="xl" variant="hero">
                Sign Up Free
              </Button>
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Login
              </Button>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-8 pt-8 text-sm text-white">
              <div>
                <div className="text-2xl font-bold text-white">100K+</div>
                <div className="text-white/80">Active Users</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-white/80">Matches Made</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-white">4.8★</div>
                <div className="text-white/80">User Rating</div>
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
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
