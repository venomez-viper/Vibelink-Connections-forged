import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const floatingTraits = [
  { text: "Empathetic", top: "15%", left: "5%", delay: "0s" },
  { text: "Adventurous", top: "25%", right: "8%", delay: "0.5s" },
  { text: "Introvert", top: "55%", left: "3%", delay: "1s" },
  { text: "Creative", top: "70%", right: "5%", delay: "1.5s" },
  { text: "Ambitious", top: "40%", left: "7%", delay: "0.8s" },
  { text: "Wholesome", top: "80%", left: "20%", delay: "1.2s" },
];

const steps = [
  { icon: "🧠", label: "Take the Quiz", desc: "10 pages of personality questions" },
  { icon: "💬", label: "Chat First", desc: "Text-only conversations to build real connection" },
  { icon: "📸", label: "Reveal", desc: "Unlock photos when you're both ready" },
];

const Hero = () => {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-32 md:pt-24 pb-20"
      style={{ background: "linear-gradient(135deg, #C1003A, #8B0028)" }}
    >
      {/* Floating personality trait cards */}
      {floatingTraits.map((trait, i) => (
        <div
          key={i}
          className="absolute hidden md:flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30 animate-pulse"
          style={{
            top: trait.top,
            left: (trait as any).left,
            right: (trait as any).right,
            animationDelay: trait.delay,
            animationDuration: "3s",
          }}
        >
          {trait.text}
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto text-white space-y-8">
          <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
            Personality-first dating — no swiping, just vibing ✨
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight">
            Connect Deeper.{" "}
            <span className="font-freestyle italic">Date Smarter.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: "#FFECEC" }}>
            VibeLink matches you on who you actually are — not just what you look like. Take a personality quiz, chat first, unlock photos when you're ready.
          </p>

          {/* 3 Steps */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="text-3xl">{s.icon}</div>
                <p className="font-semibold text-sm">{s.label}</p>
                <p className="text-xs text-white/70 hidden sm:block">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              size="lg"
              asChild
              className="bg-white hover:bg-white/90 rounded-full font-semibold min-h-[50px] px-10 shadow-lg"
              style={{ color: "#FF4D6D" }}
            >
              <Link to="/signup">Find Your Vibe →</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full min-h-[50px] px-10"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 text-white">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">100K+</div>
              <div style={{ color: "#FFECEC" }} className="text-sm mt-1">Active Users</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">50K+</div>
              <div style={{ color: "#FFECEC" }} className="text-sm mt-1">Matches Made</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">4.8★</div>
              <div style={{ color: "#FFECEC" }} className="text-sm mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0 leading-[0] -mb-px">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full block h-[100px] md:h-[140px]" preserveAspectRatio="none">
          <path d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#FFFFFF" stroke="none" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
