import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    slug: "why-personality-beats-looks",
    title: "Why Personality Beats Looks in Modern Dating",
    excerpt: "Research shows couples who connected emotionally first report higher long-term satisfaction. Here's the science behind personality-first dating.",
    author: "Dr. Emily Rodriguez",
    date: "March 10, 2026",
    readTime: "6 min read",
    category: "Psychology",
    image: "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?w=800&h=400&fit=crop",
    featured: true,
  },
  {
    slug: "how-vibelink-matching-works",
    title: "How VibeLink's Personality Matching Algorithm Works",
    excerpt: "A transparent look under the hood at the weighted compatibility system that powers your matches — and why we built it this way.",
    author: "The VibeLink Team",
    date: "March 8, 2026",
    readTime: "8 min read",
    category: "Product",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    featured: true,
  },
  {
    slug: "perfect-dating-profile",
    title: "10 Tips for Creating the Perfect Dating Profile",
    excerpt: "Your personality is your greatest asset on VibeLink. Here's how to let it shine through every question, answer, and bio.",
    author: "Sarah Johnson",
    date: "March 15, 2026",
    readTime: "5 min read",
    category: "Tips",
    image: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    slug: "first-date-ideas",
    title: "First Date Ideas That Actually Build Connection",
    excerpt: "Skip the awkward coffee sit-down. These first date formats are scientifically designed to help two people actually get to know each other.",
    author: "Michael Chen",
    date: "March 12, 2026",
    readTime: "5 min read",
    category: "Dating Tips",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    slug: "psychology-of-online-dating",
    title: "The Psychology of Online Dating: What the Science Says",
    excerpt: "What does research actually tell us about who finds love online, what makes profiles successful, and why most dating apps are designed against your interests?",
    author: "Dr. Emily Rodriguez",
    date: "March 8, 2026",
    readTime: "7 min read",
    category: "Psychology",
    image: "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    slug: "staying-safe-online",
    title: "How to Stay Safe While Dating Online",
    excerpt: "Essential red flags, safety practices, and the mindset shifts that protect you while you look for love online.",
    author: "Jessica Martinez",
    date: "March 5, 2026",
    readTime: "6 min read",
    category: "Safety",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop",
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  Psychology: "bg-purple-100 text-purple-800",
  Product: "bg-blue-100 text-blue-800",
  Tips: "bg-green-100 text-green-800",
  "Dating Tips": "bg-orange-100 text-orange-800",
  Safety: "bg-red-100 text-red-800",
};

const Blog = () => {
  const navigate = useNavigate();
  const featured = blogPosts.filter((p) => p.featured);
  const rest = blogPosts.filter((p) => !p.featured);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-36 pb-12 px-4 text-center" style={{ background: "linear-gradient(135deg, #C1003A11, #ffffff)" }}>
        <div className="container mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary">VibeLink Blog</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Dating insights, <span className="font-freestyle" style={{ color: "#C1003A" }}>honestly</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Science-backed advice, product transparency, and real talk about modern relationships.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Featured</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featured.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary/30"
                onClick={() => navigate(`/blog/${post.slug}`)}>
                <div className="relative overflow-hidden h-52">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <Badge className={categoryColors[post.category] || ""}>{post.category}</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* All Posts */}
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">All Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer hover:border-primary/20"
                onClick={() => navigate(`/blog/${post.slug}`)}>
                <div className="relative overflow-hidden h-44">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <Badge className={`text-xs ${categoryColors[post.category] || ""}`}>{post.category}</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors text-base leading-snug line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-xs mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</div>
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
