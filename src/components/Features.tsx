import { Brain, Shield, MessageCircle, Search, Lock, Heart, Languages, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Compatibility Matchmaking",
    description: "Smart algorithms that understand your preferences and connect you with compatible matches"
  },
  {
    icon: Shield,
    title: "Verified Profiles & Photo Authentication",
    description: "Real people, real connections. Every profile is verified for your safety"
  },
  {
    icon: MessageCircle,
    title: "In-app Chat & Video Calls",
    description: "Connect instantly with secure messaging and video calls built right in"
  },
  {
    icon: Search,
    title: "Advanced Search Filters",
    description: "Find your perfect match by language, interests, values, and lifestyle preferences"
  },
  {
    icon: Lock,
    title: "Modern Privacy Features",
    description: "Private browsing and Safe Meet Mode to protect your personal information"
  },
  {
    icon: Sparkles,
    title: "Fun Couple Challenges & Icebreakers",
    description: "Break the ice with engaging activities and conversation starters"
  },
  {
    icon: Languages,
    title: "Multi-language Support",
    description: "Connect in your language - full support for Hindi, English, and more"
  },
  {
    icon: Heart,
    title: "Celebrating Indian Diversity",
    description: "Embracing all cultures, traditions, and backgrounds across India"
  }
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">VibeLink?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover meaningful connections with features designed for modern India
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-card group cursor-pointer"
              >
                <div className="mb-4 inline-block p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
