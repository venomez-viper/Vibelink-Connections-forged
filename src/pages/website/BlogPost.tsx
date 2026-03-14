import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/website/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, User, ArrowLeft, Clock, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const blogPosts: Record<string, any> = {
  "why-personality-beats-looks": {
    id: "why-personality-beats-looks",
    title: "Why Personality Beats Looks in Modern Dating",
    excerpt: "Research shows that couples who connected emotionally first report higher long-term satisfaction. Here's the science behind personality-first dating.",
    author: "Dr. Emily Rodriguez",
    role: "Relationship Psychologist",
    date: "March 10, 2026",
    readTime: "6 min read",
    category: "Psychology",
    image: "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?w=1200&h=500&fit=crop",
    content: [
      {
        type: "intro",
        text: "We've been sold a lie. Swipe right if they're attractive, swipe left if they're not. In under a second, you've judged a human being entirely on their appearance. But what if the most compatible person for you has an average profile photo — and the least compatible person has a stunning one?",
      },
      {
        type: "heading",
        text: "What the research actually says",
      },
      {
        type: "paragraph",
        text: "A landmark study by Northwestern University followed 193 couples across four years. The result? Physical attractiveness had almost no correlation with relationship satisfaction after the first few months. What predicted long-term happiness was personality compatibility — specifically how well partners aligned on values, communication style, and emotional openness.",
      },
      {
        type: "paragraph",
        text: "A separate meta-analysis of 43 studies on online dating found that users who spent more time reading profiles before swiping reported 34% higher match satisfaction compared to those who made instant visual decisions. The conclusion was clear: slowing down and reading who someone is — not just what they look like — leads to better outcomes.",
      },
      {
        type: "heading",
        text: "The 'halo effect' is working against you",
      },
      {
        type: "paragraph",
        text: "Psychologists call it the halo effect: when we find someone physically attractive, we unconsciously assume they're also intelligent, kind, funny, and emotionally mature. We project a whole personality onto a face. This is why so many first dates that start with high physical attraction end in disappointment — the real person doesn't match the fantasy we built around their photo.",
      },
      {
        type: "paragraph",
        text: "The reverse is equally true. Research by University of Texas psychologists Lucy Hunt and Paul Eastwick found that personality attractiveness — how much you like someone's character — actually influences how physically attractive you perceive them to be over time. People who were initially rated as 'average' looking were rated significantly more attractive after their conversation partners got to know them.",
      },
      {
        type: "quote",
        text: "Beauty is not in the face; beauty is a light in the heart. The research backs this up — personality literally changes how attractive we perceive people to be.",
        author: "Paul Eastwick, University of Texas",
      },
      {
        type: "heading",
        text: "Why VibeLink flips the script",
      },
      {
        type: "paragraph",
        text: "VibeLink was designed around this research. Before you ever see a photo, you know someone's relationship goals, how they handle conflict, what their love language is, whether they're an introvert or extrovert, and what genuinely makes them laugh. By the time photos are unlocked, you've already decided if you like this person for who they are.",
      },
      {
        type: "paragraph",
        text: "The result? Matches that are grounded in reality, not projection. Conversations that flow because you already have context. And a dramatically lower chance of the crushing disappointment that comes when a photogenic stranger turns out to have nothing in common with you.",
      },
      {
        type: "heading",
        text: "The practical takeaway",
      },
      {
        type: "paragraph",
        text: "Next time you're dating — online or off — resist the urge to let appearance be the first filter. Ask better questions. Listen to how someone talks about their values. Notice whether their sense of humor aligns with yours. These are the things that will matter in year three of a relationship, not the angle of a jawline in a profile photo.",
      },
    ],
    tags: ["Psychology", "Dating Science", "Personality", "Research"],
    relatedPosts: ["psychology-of-online-dating", "how-vibelink-matching-works", "first-date-ideas"],
  },

  "how-vibelink-matching-works": {
    id: "how-vibelink-matching-works",
    title: "How VibeLink's Personality Matching Algorithm Works",
    excerpt: "A transparent look under the hood at the weighted compatibility system that powers your matches — and why we built it this way.",
    author: "The VibeLink Team",
    role: "VibeLink Engineering",
    date: "March 8, 2026",
    readTime: "8 min read",
    category: "Product",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=500&fit=crop",
    content: [
      {
        type: "intro",
        text: "Most dating apps treat compatibility as a black box. You swipe, you match, you hope for the best. We think you deserve to know exactly why we think two people might be great together — and where we might be wrong.",
      },
      {
        type: "heading",
        text: "The 7 dimensions we measure",
      },
      {
        type: "paragraph",
        text: "When you complete VibeLink's 10-page questionnaire, you're building a personality profile across seven key dimensions that research shows matter most for long-term compatibility.",
      },
      {
        type: "list",
        items: [
          "Relationship Goal (25%) — Are you both looking for the same type of relationship? This is weighted highest because mismatched intentions are the #1 predictor of early relationship failure.",
          "Love Language (20%) — Using Jaccard similarity across your selected love languages. Sharing at least one core love language strongly predicts emotional satisfaction.",
          "Social Battery (15%) — How introverted or extroverted you are. Extreme mismatches (very introverted + very extroverted) create recurring friction around socialising.",
          "Life Goals (15%) — Whether your core ambitions align — career, family, adventure, or balance. Incompatible life trajectories are a leading cause of long-term relationship breakdown.",
          "Conflict Style (10%) — How you handle disagreement. 'Compromise' types are compatible with nearly everyone. 'Direct' and 'Avoid' styles create friction with each other.",
          "Shared Interests (10%) — Jaccard similarity of your hobby selections. Shared activities build memories and create natural date ideas.",
          "Humor Type (5%) — Compatible humor creates warmth and ease. Incompatible humor (wholesome vs dark, for example) is a subtle but persistent source of friction.",
        ],
      },
      {
        type: "heading",
        text: "How the score is calculated",
      },
      {
        type: "paragraph",
        text: "Each dimension produces a similarity score between 0 and 1. We multiply each score by its weight and sum the results. The final compatibility percentage is a weighted average — it's honest, not inflated. A 72% match means you're genuinely well-aligned on most dimensions, not that we rounded up to make you feel good.",
      },
      {
        type: "quote",
        text: "We could make everyone's score look like 90%+. We chose not to. Honesty in compatibility scoring leads to better conversations and healthier relationships.",
        author: "VibeLink Team",
      },
      {
        type: "heading",
        text: "What we don't factor in (yet)",
      },
      {
        type: "paragraph",
        text: "Our current algorithm doesn't factor in location proximity, income, education, or physical type preferences. This is intentional — these are the dimensions that tend to create shallow filtering. We're focused on character compatibility first. Location and logistics can always be figured out. Fundamentally incompatible values cannot.",
      },
      {
        type: "heading",
        text: "What's coming next",
      },
      {
        type: "paragraph",
        text: "We're building semantic matching using vector embeddings — a technique that understands the meaning behind your answers, not just the category. Two people who both answer 'adventure' to their life goals but have completely different definitions of adventure will get a lower semantic similarity score than two people who both describe their ideal life in ways that actually overlap. We expect this to significantly improve match quality.",
      },
    ],
    tags: ["Product", "Algorithm", "Matching", "Transparency"],
    relatedPosts: ["why-personality-beats-looks", "psychology-of-online-dating", "perfect-dating-profile"],
  },

  "perfect-dating-profile": {
    id: "perfect-dating-profile",
    title: "10 Tips for Creating the Perfect Dating Profile",
    excerpt: "Your personality is your greatest asset on VibeLink. Here's how to let it shine through every question, answer, and bio.",
    author: "Sarah Johnson",
    role: "Relationship Coach",
    date: "March 15, 2026",
    readTime: "5 min read",
    category: "Tips",
    image: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=1200&h=500&fit=crop",
    content: [
      {
        type: "intro",
        text: "On most dating apps, a great profile means great photos. On VibeLink, great photos come later — your personality is what makes the first impression. Here are 10 ways to make yours unforgettable.",
      },
      {
        type: "heading",
        text: "1. Be specific, not aspirational",
      },
      {
        type: "paragraph",
        text: "Don't say you love 'travel.' Everyone says they love travel. Say you're planning to spend three months in Southeast Asia next year and you're terrified and excited in equal measure. Specificity is what creates connection — it gives someone a hook to respond to.",
      },
      {
        type: "heading",
        text: "2. Answer the questionnaire honestly, not ideally",
      },
      {
        type: "paragraph",
        text: "It's tempting to answer personality questions as the person you aspire to be. Don't. The algorithm matches you with people who are compatible with who you actually are right now. Presenting a false version of yourself leads to matches with people who are wrong for the real you.",
      },
      {
        type: "heading",
        text: "3. Your bio is a conversation starter, not a resume",
      },
      {
        type: "paragraph",
        text: "The best bios end with a question or an observation that invites a reply. 'I make excellent pasta and questionable life decisions — ask me about either' is far more engaging than a list of hobbies.",
      },
      {
        type: "heading",
        text: "4. Select interests you'd actually talk about",
      },
      {
        type: "paragraph",
        text: "Only select hobbies you'd be happy to spend an entire first date discussing. If you picked 'cooking' because it sounds good but you eat cereal for dinner most nights, you're setting up an awkward conversation.",
      },
      {
        type: "heading",
        text: "5. Be honest about your relationship pace",
      },
      {
        type: "paragraph",
        text: "If you take things slowly, say so. If you fall hard and fast, own it. The right person will appreciate your honesty. The wrong person will self-select out — which is exactly what you want.",
      },
      {
        type: "heading",
        text: "6. Your love languages reveal how you need to be loved",
      },
      {
        type: "paragraph",
        text: "Select all the love languages that genuinely resonate with you, not just one. Many people have a primary and secondary. Being clear about this helps your match understand from day one how to make you feel valued.",
      },
      {
        type: "heading",
        text: "7. Don't hide your introversion or extroversion",
      },
      {
        type: "paragraph",
        text: "Some people find extroversion attractive. Others find it exhausting. There's someone out there who matches your social battery perfectly — but only if you're honest about where you fall on the scale.",
      },
      {
        type: "heading",
        text: "8. Your deal-breakers are a gift to everyone",
      },
      {
        type: "paragraph",
        text: "Listing deal-breakers feels vulnerable. It's actually one of the kindest things you can do. It saves everyone time and prevents painful mismatches. List yours clearly and without apology.",
      },
      {
        type: "heading",
        text: "9. When you do unlock photos, choose authentic ones",
      },
      {
        type: "paragraph",
        text: "By the time photos are exchanged on VibeLink, your match already likes you as a person. This means authenticity matters more than looking perfect. A photo of you laughing mid-sentence will land better than a heavily edited portrait.",
      },
      {
        type: "heading",
        text: "10. Update your profile as you grow",
      },
      {
        type: "paragraph",
        text: "You're not the same person you were six months ago. Your profile should reflect who you are now — your current goals, your current interests, your current definition of an ideal relationship. Keep it fresh.",
      },
    ],
    tags: ["Tips", "Profile", "Dating Advice", "Getting Started"],
    relatedPosts: ["why-personality-beats-looks", "first-date-ideas", "staying-safe-online"],
  },

  "first-date-ideas": {
    id: "first-date-ideas",
    title: "First Date Ideas That Actually Build Connection",
    excerpt: "Skip the awkward coffee sit-down. These first date formats are scientifically designed to help two people actually get to know each other.",
    author: "Michael Chen",
    role: "Dating Coach",
    date: "March 12, 2026",
    readTime: "5 min read",
    category: "Dating Tips",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=500&fit=crop",
    content: [
      {
        type: "intro",
        text: "Most first date advice focuses on where to go. The real question is what format creates the best conditions for two people to actually connect. Here's what works — backed by psychology.",
      },
      {
        type: "heading",
        text: "Why the classic coffee date underperforms",
      },
      {
        type: "paragraph",
        text: "Sitting across from a stranger in a coffee shop puts both people in interview mode. The setting is formal, the stakes feel high, and there's nothing to do but talk — which sounds great in theory but creates intense pressure when you don't yet have rapport. Research on social bonding shows that shared activity creates connection faster than pure conversation.",
      },
      {
        type: "heading",
        text: "The side-by-side principle",
      },
      {
        type: "paragraph",
        text: "Psychologists have found that side-by-side activities (walking, cooking, visiting a market) reduce social anxiety compared to face-to-face settings. When you're both looking at the same thing — a dish you're cooking, a painting in a gallery, a path through a park — the pressure of sustained eye contact drops and conversation flows more naturally.",
      },
      {
        type: "heading",
        text: "5 formats that actually work",
      },
      {
        type: "list",
        items: [
          "A food market walk — Low commitment, high variety. You're moving, tasting, discovering together. Natural conversation triggers everywhere you look.",
          "A cooking class — You're working toward a shared goal. Laughter is built in. You get to eat the result together.",
          "A walk + coffee (in that order) — Walk first to build comfort, then sit down for coffee once rapport exists. The sit-down feels earned.",
          "A museum or gallery — Shared observation is one of the fastest ways to understand how someone thinks. What they notice, what bores them, what excites them — deeply revealing.",
          "Mini golf or bowling — Permission to be silly early in a date is invaluable. Playfulness is a major compatibility signal and these low-stakes games unlock it.",
        ],
      },
      {
        type: "heading",
        text: "The 36-questions approach",
      },
      {
        type: "paragraph",
        text: "Researcher Arthur Aron famously demonstrated that two strangers could generate feelings of closeness by asking each other a series of progressively deeper questions. You don't need to use his exact list — but the principle applies. Move from light questions to more personal ones over the course of the date. By the end, you'll know more about this person than many of their longtime friends do.",
      },
      {
        type: "quote",
        text: "The best first dates aren't about impressing someone. They're about creating conditions where both people feel safe enough to be real.",
        author: "Michael Chen",
      },
      {
        type: "heading",
        text: "What to avoid",
      },
      {
        type: "paragraph",
        text: "Avoid movies (no conversation), loud bars (can't hear each other), and any activity where one person has a clear skill advantage (you don't want your date feeling embarrassed). The goal is mutual comfort and mutual revelation — choose settings that serve both.",
      },
    ],
    tags: ["Dating Tips", "First Date", "Connection", "Ideas"],
    relatedPosts: ["perfect-dating-profile", "staying-safe-online", "psychology-of-online-dating"],
  },

  "psychology-of-online-dating": {
    id: "psychology-of-online-dating",
    title: "The Psychology of Online Dating: What the Science Says",
    excerpt: "What does research actually tell us about who finds love online, what makes profiles successful, and why most dating apps are designed against your interests?",
    author: "Dr. Emily Rodriguez",
    role: "Relationship Psychologist",
    date: "March 8, 2026",
    readTime: "7 min read",
    category: "Psychology",
    image: "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?w=1200&h=500&fit=crop",
    content: [
      {
        type: "intro",
        text: "Online dating has been studied extensively over the past decade. The findings are fascinating — and often directly contradict how most dating apps are designed.",
      },
      {
        type: "heading",
        text: "Who actually finds relationships online",
      },
      {
        type: "paragraph",
        text: "According to Pew Research Center, 12% of Americans who have used a dating app are in a committed relationship or married to someone they met online. That sounds modest — but it now represents the second most common way couples meet, surpassing mutual friends, work, and school. Among adults under 30, it's the most common.",
      },
      {
        type: "heading",
        text: "The paradox of choice problem",
      },
      {
        type: "paragraph",
        text: "Psychologist Barry Schwartz's 'paradox of choice' research has been repeatedly demonstrated in online dating contexts. When users are shown more potential matches, they report lower satisfaction with the matches they make. The abundance of options creates the illusion that a better option is always just one swipe away — making it harder to invest in any single connection.",
      },
      {
        type: "paragraph",
        text: "One study found that users who were limited to seeing 6 potential matches at a time were more likely to message those matches and reported higher connection quality than users with unlimited browsing. More choice actively makes you worse at choosing.",
      },
      {
        type: "heading",
        text: "Why swiping apps are designed to keep you single",
      },
      {
        type: "paragraph",
        text: "Dating apps monetize engagement, not successful relationships. Every time you swipe, the app collects data. Every premium feature sold to help you get more matches generates revenue. A user who finds a relationship and leaves the app is a lost customer. This creates a perverse incentive: design the app for addictive swiping behavior, not for finding a partner.",
      },
      {
        type: "quote",
        text: "The business model of most dating apps is fundamentally misaligned with the user's goal. They profit from your loneliness.",
        author: "Dr. Emily Rodriguez",
      },
      {
        type: "heading",
        text: "What actually predicts match quality",
      },
      {
        type: "paragraph",
        text: "A 2023 meta-analysis of online dating outcomes identified three factors that consistently predicted relationship satisfaction: similarity in values (not lifestyle), communication quality in early interactions, and realistic expectations going into the first meeting. Physical attractiveness of the profile predicted initial matching rate but had no significant correlation with relationship longevity.",
      },
      {
        type: "heading",
        text: "The self-disclosure loop",
      },
      {
        type: "paragraph",
        text: "Research on computer-mediated communication shows that people disclose more personal information online than in person, and this accelerated self-disclosure can create feelings of intimacy faster than in-person dating. The risk is that this can lead to 'parasocial intimacy' — feeling close to someone you haven't yet fully experienced in the real world. Being aware of this phenomenon helps you maintain realistic expectations while still enjoying the depth of online conversation.",
      },
    ],
    tags: ["Psychology", "Research", "Online Dating", "Science"],
    relatedPosts: ["why-personality-beats-looks", "how-vibelink-matching-works", "staying-safe-online"],
  },

  "staying-safe-online": {
    id: "staying-safe-online",
    title: "How to Stay Safe While Dating Online",
    excerpt: "Essential red flags, safety practices, and the mindset shifts that protect you while you look for love online.",
    author: "Jessica Martinez",
    role: "Digital Safety Advocate",
    date: "March 5, 2026",
    readTime: "6 min read",
    category: "Safety",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=500&fit=crop",
    content: [
      {
        type: "intro",
        text: "Online dating is safer than ever — and still requires your full attention. Here's a practical guide to protecting yourself without letting fear prevent genuine connection.",
      },
      {
        type: "heading",
        text: "Before the first message",
      },
      {
        type: "paragraph",
        text: "Never share your surname, workplace, phone number, or social media handles in your profile or early messages. VibeLink automatically masks contact details in chat — but that protection only works if you don't volunteer the information through creative workarounds. Keep personal identifiers off the table until you've established genuine trust.",
      },
      {
        type: "heading",
        text: "Red flags that are easy to miss",
      },
      {
        type: "list",
        items: [
          "They refuse video or voice calls and always have an excuse — this is a strong signal of catfishing.",
          "They escalate emotional intimacy very quickly — declarations of love within days is a hallmark of romance scam behaviour.",
          "They ask about your financial situation or describe a crisis where they need help — always a scam.",
          "Their personality seems to shift between conversations — inconsistency can indicate multiple people managing one account.",
          "They become defensive or hostile when you ask basic questions about their life.",
        ],
      },
      {
        type: "heading",
        text: "The reverse image search habit",
      },
      {
        type: "paragraph",
        text: "Before meeting anyone in person, reverse image search their profile photos using Google Images or TinEye. This takes 30 seconds and immediately identifies stolen photos from social media or stock photo sites. It's not paranoia — it's due diligence.",
      },
      {
        type: "heading",
        text: "First meeting non-negotiables",
      },
      {
        type: "list",
        items: [
          "Always meet in a public place — never at your home or theirs for a first meeting.",
          "Tell a friend or family member where you're going, who you're meeting, and what time you expect to be back.",
          "Have your own transport — don't rely on your date to get you home.",
          "Keep your phone charged and accessible.",
          "Trust your gut. If something feels off, it's okay to leave. You don't owe anyone your continued presence.",
        ],
      },
      {
        type: "heading",
        text: "VibeLink's built-in safety features",
      },
      {
        type: "paragraph",
        text: "VibeLink masks all phone numbers, email addresses, and social media handles in messages automatically. Photos are locked until both users mutually consent to share them. And our personality-first approach means you've built a genuine understanding of someone's values before any personal information is exchanged. These aren't just features — they're a philosophy: trust should be built before it's assumed.",
      },
      {
        type: "quote",
        text: "Safety and connection aren't opposites. The safest relationships are built on the slowest foundations of trust.",
        author: "Jessica Martinez",
      },
    ],
    tags: ["Safety", "Online Dating", "Red Flags", "Protection"],
    relatedPosts: ["psychology-of-online-dating", "perfect-dating-profile", "first-date-ideas"],
  },
};

const relatedPostMeta: Record<string, { title: string; category: string }> = {
  "why-personality-beats-looks": { title: "Why Personality Beats Looks in Modern Dating", category: "Psychology" },
  "how-vibelink-matching-works": { title: "How VibeLink's Matching Algorithm Works", category: "Product" },
  "perfect-dating-profile": { title: "10 Tips for the Perfect Dating Profile", category: "Tips" },
  "first-date-ideas": { title: "First Date Ideas That Actually Build Connection", category: "Dating Tips" },
  "psychology-of-online-dating": { title: "The Psychology of Online Dating", category: "Psychology" },
  "staying-safe-online": { title: "How to Stay Safe While Dating Online", category: "Safety" },
};

const categoryColors: Record<string, string> = {
  Psychology: "bg-purple-100 text-purple-800",
  Product: "bg-blue-100 text-blue-800",
  Tips: "bg-green-100 text-green-800",
  "Dating Tips": "bg-orange-100 text-orange-800",
  Safety: "bg-red-100 text-red-800",
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const post = slug ? blogPosts[slug] : null;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-20">
          <h1 className="text-3xl font-bold">Post not found</h1>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share it with someone who needs to read this." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <div className="relative h-[420px] mt-16">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto max-w-4xl">
          <Badge className={`mb-3 ${categoryColors[post.category] || "bg-gray-100 text-gray-800"}`}>
            {post.category}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{post.author}</span><span className="text-white/50">· {post.role}</span></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{post.date}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{post.readTime}</span></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">

          {/* Back + Share */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate("/blog")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          {/* Intro callout */}
          <div className="p-6 rounded-2xl mb-10 border-l-4 text-lg font-medium leading-relaxed text-foreground/80" style={{ borderColor: "#C1003A", background: "rgba(193,0,58,0.05)" }}>
            {post.content[0].text}
          </div>

          {/* Article body */}
          <article className="prose prose-lg max-w-none">
            {post.content.slice(1).map((block: any, i: number) => {
              if (block.type === "heading") return (
                <h2 key={i} className="text-2xl font-bold text-foreground mt-10 mb-4">{block.text}</h2>
              );
              if (block.type === "paragraph") return (
                <p key={i} className="text-muted-foreground leading-relaxed mb-5 text-base">{block.text}</p>
              );
              if (block.type === "list") return (
                <ul key={i} className="space-y-3 mb-6">
                  {block.items.map((item: string, j: number) => (
                    <li key={j} className="flex gap-3 items-start">
                      <span className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" style={{ background: "#C1003A" }} />
                      <span className="text-muted-foreground text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              );
              if (block.type === "quote") return (
                <blockquote key={i} className="my-8 p-6 rounded-2xl" style={{ background: "rgba(193,0,58,0.06)", borderLeft: "4px solid #C1003A" }}>
                  <p className="text-lg font-medium text-foreground italic mb-3">"{block.text}"</p>
                  {block.author && <p className="text-sm text-muted-foreground">— {block.author}</p>}
                </blockquote>
              );
              return null;
            })}
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 rounded-2xl text-white text-center" style={{ background: "linear-gradient(135deg, #C1003A, #8B0028)" }}>
            <h3 className="text-2xl font-bold mb-2">Ready to find your vibe?</h3>
            <p className="text-white/80 mb-6">Join thousands of people connecting through personality first.</p>
            <Button asChild className="bg-white font-semibold rounded-full px-8" style={{ color: "#C1003A" }}>
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* Related posts */}
          {post.relatedPosts?.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-6">Keep reading</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {post.relatedPosts.map((slug: string) => {
                  const related = relatedPostMeta[slug];
                  if (!related) return null;
                  return (
                    <Card key={slug} className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => navigate(`/blog/${slug}`)}>
                      <Badge className={`mb-2 text-xs ${categoryColors[related.category] || ""}`}>{related.category}</Badge>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors leading-snug">{related.title}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
