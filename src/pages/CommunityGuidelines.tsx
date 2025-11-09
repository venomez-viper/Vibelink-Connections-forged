import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const guidelines = [
  {
    title: "Be Respectful",
    description: "Treat others with kindness and respect. No harassment, hate speech, or discriminatory behavior will be tolerated."
  },
  {
    title: "Be Authentic",
    description: "Use real photos and honest information. Impersonation and fake profiles are not allowed."
  },
  {
    title: "Keep It Appropriate",
    description: "No nudity, sexually explicit content, or inappropriate messages. Keep conversations friendly and respectful."
  },
  {
    title: "Stay Safe",
    description: "Don't share personal information too quickly. Meet in public places and tell someone about your plans."
  },
  {
    title: "Report Issues",
    description: "If you encounter inappropriate behavior, spam, or feel unsafe, report it immediately. We take all reports seriously."
  },
  {
    title: "No Solicitation",
    description: "VibeLink is for dating and relationships only. No commercial solicitation, advertising, or promotional activities."
  },
  {
    title: "One Person, One Account",
    description: "Maintain only one account per person. Multiple accounts may result in suspension."
  },
  {
    title: "Respect Privacy",
    description: "Don't share others' personal information or conversations without their consent."
  }
];

const CommunityGuidelines = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Title Section */}
      <section className="pt-40 pb-12 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Community Guidelines
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Creating a safe and welcoming space for everyone
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 mb-8">
            <p className="text-lg text-muted-foreground text-center">
              VibeLink is built on respect, authenticity, and safety. These guidelines help ensure that everyone has a positive experience on our platform. Violations may result in warnings, account suspension, or permanent removal.
            </p>
          </Card>
        </div>
      </section>

      {/* Guidelines */}
      <section className="pb-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-6">
            {guidelines.map((guideline, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {guideline.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {guideline.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enforcement */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Enforcement
            </h2>
            <p className="text-muted-foreground text-center">
              We review all reports and take appropriate action based on the severity of the violation. Our team is committed to maintaining a safe and respectful community. If you believe your account was suspended in error, please contact our support team.
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CommunityGuidelines;
