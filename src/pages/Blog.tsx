import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Creating the Perfect Dating Profile",
    excerpt: "Learn how to showcase your personality and attract compatible matches with these expert tips for crafting an engaging dating profile.",
    author: "Sarah Johnson",
    date: "March 15, 2024",
    image: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=400&fit=crop"
  },
  {
    id: 2,
    title: "First Date Ideas That Actually Work",
    excerpt: "Move beyond coffee dates with these creative and fun first date ideas that help you connect on a deeper level.",
    author: "Michael Chen",
    date: "March 12, 2024",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop"
  },
  {
    id: 3,
    title: "The Psychology of Online Dating: What Science Says",
    excerpt: "Discover the fascinating research behind online dating and how understanding psychology can improve your matching success.",
    author: "Dr. Emily Rodriguez",
    date: "March 8, 2024",
    image: "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?w=800&h=400&fit=crop"
  },
  {
    id: 4,
    title: "How to Stay Safe While Dating Online",
    excerpt: "Essential safety tips and red flags to watch out for when meeting people online and taking relationships offline.",
    author: "Jessica Martinez",
    date: "March 5, 2024",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-primary via-primary-dark to-primary">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            VibeLink Blog
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Dating tips, relationship advice, and success stories
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Card 
                key={post.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
