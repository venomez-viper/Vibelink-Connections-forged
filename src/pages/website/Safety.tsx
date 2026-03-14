import Header from "@/components/Header";
import Footer from "@/components/website/Footer";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";

const safetyFeatures = [
  {
    icon: Shield,
    title: "Profile Verification",
    description: "All profiles go through verification to ensure authenticity and reduce fake accounts."
  },
  {
    icon: Lock,
    title: "Data Encryption",
    description: "Your personal information and conversations are protected with end-to-end encryption."
  },
  {
    icon: Eye,
    title: "Private Browsing",
    description: "Control who sees your profile and browse anonymously when you want privacy."
  },
  {
    icon: AlertTriangle,
    title: "Report & Block",
    description: "Easily report suspicious behavior or block users with one tap. We take action fast."
  },
  {
    icon: CheckCircle,
    title: "Safe Meet Mode",
    description: "Share your meeting plans with trusted contacts for added security."
  },
  {
    icon: UserCheck,
    title: "Background Checks",
    description: "Optional enhanced verification with background screening for premium members."
  }
];

const safetyTips = [
  "Never share personal information like your address or financial details",
  "Meet in public places for first dates",
  "Tell a friend or family member about your plans",
  "Trust your instincts - if something feels off, it probably is",
  "Keep conversations on the platform until you feel comfortable",
  "Report any suspicious or inappropriate behavior immediately"
];

const Safety = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Title Section */}
      <section className="pt-40 pb-12 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Your Safety Is Our Priority
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're committed to creating a safe, respectful environment for meaningful connections
          </p>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Safety Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple layers of protection to keep you safe
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {safetyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-card group"
                >
                  <div className="mb-4 inline-block p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
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

      {/* Safety Tips */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Safety Tips for Dating
            </h2>
            <p className="text-lg text-muted-foreground">
              Stay safe while meeting new people
            </p>
          </div>
          
          <Card className="p-8">
            <ul className="space-y-4">
              {safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Safety;
