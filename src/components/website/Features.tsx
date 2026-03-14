import { Brain, MessageCircle, Lock, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    emoji: "🧠",
    title: "Personality Matching",
    description:
      "Our weighted algorithm scores compatibility across 7 dimensions — relationship goals, love languages, social battery, values, and more. No swiping, just science.",
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "Text-First Connection",
    description:
      "Chat before you see photos. Build genuine chemistry through conversation — the way real connections are made. Looks come second, personality comes first.",
  },
  {
    icon: Lock,
    emoji: "🔒",
    title: "Privacy Protection",
    description:
      "Phone numbers, emails, and social handles are automatically masked in every message. You control what you share and when — full stop.",
  },
  {
    icon: Camera,
    emoji: "📸",
    title: "Gated Photo Reveal",
    description:
      "Photos stay hidden until both of you consent to share them. No awkward appearances — just mutual, intentional moments of connection.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why <span className="text-primary">VibeLink</span> is Different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for people who want real connections — not just pretty photos and empty swipes.
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
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-2xl">{feature.emoji}</span>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
