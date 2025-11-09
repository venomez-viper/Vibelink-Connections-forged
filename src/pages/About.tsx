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
            About VibeLink
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
                VibeLink was born from a simple belief: everyone deserves to find meaningful connections in today's fast-paced digital world. Founded in 2024, we set out to create a dating platform that prioritizes authenticity, safety, and real relationships over superficial swipes.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Our team of passionate developers, relationship experts, and designers came together to build something different—a platform where technology enhances human connection rather than replacing it. We use cutting-edge AI to match people based on compatibility, not just looks.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Today, VibeLink has helped thousands of singles find love, friendship, and companionship. But we're just getting started. Our mission is to create a world where finding meaningful connections is accessible, safe, and enjoyable for everyone.
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
            A diverse group of passionate individuals dedicated to helping you find love
          </p>
          <Card className="p-8">
            <p className="text-muted-foreground">
              Our team includes relationship psychologists, software engineers, UX designers, and customer support specialists—all working together to create the best dating experience possible. We're headquartered in San Francisco with team members around the globe.
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
