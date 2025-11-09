import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin, Briefcase, GraduationCap } from "lucide-react";

const mockProfiles = [
  {
    id: 1,
    name: "Sarah",
    age: 28,
    distance: "2 miles away",
    occupation: "Marketing Manager",
    education: "MBA Graduate",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    interests: ["Travel", "Yoga", "Coffee"]
  },
  {
    id: 2,
    name: "Michael",
    age: 32,
    distance: "5 miles away",
    occupation: "Software Engineer",
    education: "Computer Science",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    interests: ["Hiking", "Photography", "Cooking"]
  },
  {
    id: 3,
    name: "Emma",
    age: 26,
    distance: "3 miles away",
    occupation: "Graphic Designer",
    education: "Design School",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    interests: ["Art", "Music", "Reading"]
  }
];

const NearbyMatches = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState(mockProfiles);

  const handleLike = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setProfiles([]);
    }
  };

  const handlePass = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setProfiles([]);
    }
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Title Section */}
      <section className="pt-40 pb-12 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Discover Nearby Singles
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find compatible matches in your area
          </p>
        </div>
      </section>

      {/* Matching Section */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-md">
          {profiles.length > 0 ? (
            <Card className="overflow-hidden shadow-2xl">
              <div className="relative">
                <img 
                  src={currentProfile.image} 
                  alt={currentProfile.name}
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <div className="flex items-center gap-2 text-white/90 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{currentProfile.distance}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/90">
                      <Briefcase className="w-4 h-4" />
                      <span>{currentProfile.occupation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <GraduationCap className="w-4 h-4" />
                      <span>{currentProfile.education}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {currentProfile.interests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex justify-center gap-6">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full w-16 h-16 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={handlePass}
                >
                  <X className="w-8 h-8" />
                </Button>
                <Button 
                  size="lg"
                  className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
                  onClick={handleLike}
                >
                  <Heart className="w-8 h-8 fill-current" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No More Profiles
              </h2>
              <p className="text-muted-foreground mb-6">
                Check back later for new matches nearby
              </p>
              <Button onClick={() => {
                setProfiles(mockProfiles);
                setCurrentIndex(0);
              }}>
                View Again
              </Button>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NearbyMatches;
