import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Heart, Users, Globe, Target } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Authentic Connections",
    description: "We believe in fostering genuine relationships built on trust and mutual respect."
  },
  {
    icon: Users,
    title: "Inclusive Community",
    description: "Everyone deserves love. We celebrate diversity and welcome all cultures and backgrounds."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connecting people worldwide while keeping the focus on meaningful local connections."
  },
  {
    icon: Target,
    title: "Quality Matches",
    description: "Our smart algorithms prioritize compatibility over quantity for better connections."
  }
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Title Section */}
      <section className="pt-40 pb-12 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            About <span className="font-freestyle">VibeLink</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bringing people together through meaningful connections
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Our Story
            </h2>
          </div>
          
          <Card className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                <span className="font-freestyle">VibeLink</span> began as a creative extension of a DePaul University classroom project developed by four students in 2025. What started as a simple academic idea evolved into a fun, hands-on experiment — turning their imaginary company concept, <span className="font-freestyle">VibeLink</span>, into a real, interactive web experience.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                The goal wasn't to build an actual dating platform, but to explore how design, analytics, and AI could come together to make something engaging, playful, and full of heart.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                With the help of modern AI tools, the team decided to bring their idea to life — transforming a school assignment into a living, breathing demo project that shows what's possible when creativity meets technology.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Today, <span className="font-freestyle">VibeLink</span> stands as a fun student-made showcase — not a real company, but a joyful experiment that celebrates innovation, learning, and collaboration.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={index}
                  className="p-8 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-card group"
                >
                  <div className="mb-4 inline-block p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold text-card-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Four DePaul University students who turned a classroom project into something special
          </p>
          <Card className="p-8">
            <p className="text-muted-foreground text-lg leading-relaxed">
              <span className="font-freestyle">VibeLink</span> was created by four DePaul University students who wanted to extend their original class project into something more interactive and fun. Our small team of developers, designers, and analytics enthusiasts worked together to imagine what the <span className="font-freestyle">VibeLink</span> app might look like if it were real — using AI to help design, build, and refine every part of the experience. While the project began as coursework in Chicago, it quickly became a passion project — a playful blend of imagination, creativity, and teamwork designed to showcase the spirit of innovation that DePaul inspires.
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
