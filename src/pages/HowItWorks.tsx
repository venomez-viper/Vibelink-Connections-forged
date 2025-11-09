import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { UserPlus, Heart, MessageCircle, Calendar } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Profile",
    description: "Sign up in seconds and tell us about yourself. Add photos, interests, and what you're looking for in a match."
  },
  {
    icon: Heart,
    number: "02",
    title: "Get Smart Matches",
    description: "Our AI algorithm analyzes your preferences and suggests compatible singles nearby who share your interests."
  },
  {
    icon: MessageCircle,
    number: "03",
    title: "Start Connecting",
    description: "Like, chat, and video call with people you're interested in. Break the ice with fun conversation starters."
  },
  {
    icon: Calendar,
    number: "04",
    title: "Meet in Person",
    description: "When you're ready, take it offline. Use our Safe Meet Mode to share your plans with trusted contacts."
  }
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Title Section */}
      <section className="pt-40 pb-12 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            How VibeLink Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to finding meaningful connections nearby
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card 
                  key={index}
                  className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-card group"
                >
                  <div className="flex items-start gap-6">
                    <div className="text-6xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <div className="mb-4 inline-block p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-2xl font-semibold text-card-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
