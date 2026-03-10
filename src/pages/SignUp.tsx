import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, User, Mail, Lock, MapPin, Chrome } from "lucide-react";

const TOTAL_STEPS = 10;

// Page 6: Hobbies
const HOBBY_CATEGORIES = {
  "Arts & Creativity": ["Photography", "Painting", "Drawing", "Writing", "Music", "Dancing", "Theater", "Crafting"],
  "Outdoors & Sports": ["Hiking", "Running", "Cycling", "Swimming", "Yoga", "Gym", "Rock Climbing", "Surfing"],
  "Social & Entertainment": ["Cooking", "Travel", "Gaming", "Movies", "Reading", "Podcasts", "Wine Tasting", "Board Games"],
  "Tech & Learning": ["Coding", "Science", "Languages", "History", "Investing", "Meditation", "Volunteering", "Blogging"],
};

// Page 9: Deal-breakers
const DEALBREAKER_OPTIONS = [
  "Smoking", "Heavy drinking", "No job", "Different religion", "Doesn't want kids",
  "Wants kids", "Long distance", "Different political views", "No pets", "Party lifestyle",
  "Different diet", "Casual only", "No commitment", "Frequent travel",
];

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Page 1: Account Basics
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  // Page 2: Life & Values
  const [lifeGoals, setLifeGoals] = useState("");
  const [workEthic, setWorkEthic] = useState("");
  const [ambitionLevel, setAmbitionLevel] = useState([5]);

  // Page 3: Communication
  const [conflictStyle, setConflictStyle] = useState("");
  const [loveLanguages, setLoveLanguages] = useState<string[]>([]);

  // Page 4: Social Battery
  const [socialBattery, setSocialBattery] = useState("");
  const [idealWeekend, setIdealWeekend] = useState("");

  // Page 5: Relationship Goals
  const [relationshipGoal, setRelationshipGoal] = useState("");
  const [relationshipPace, setRelationshipPace] = useState("");

  // Page 6: Interests & Hobbies
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  // Page 7: Emotional Intelligence
  const [empathyScore, setEmpathyScore] = useState([5]);
  const [selfAwareness, setSelfAwareness] = useState([5]);
  const [emotionalOpenness, setEmotionalOpenness] = useState([5]);

  // Page 8: Humor & Fun
  const [humorType, setHumorType] = useState("");
  const [funActivities, setFunActivities] = useState<string[]>([]);

  // Page 9: Deal-breakers
  const [dealbreakers, setDealbreakers] = useState<string[]>([]);

  // Page 10: Match Preferences
  const [ageRange, setAgeRange] = useState([18, 50]);
  const [preferredGender, setPreferredGender] = useState("");
  const [location, setLocation] = useState("");
  const [showNearby, setShowNearby] = useState(false);

  const validatePassword = (p: string): string | null => {
    if (p.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(p)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(p)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(p)) return "Password must contain at least one number";
    return null;
  };

  const validateStep = (): boolean => {
    setError("");
    if (step === 1) {
      if (!firstName || !email || !password || !confirmPassword || !gender || !age) {
        setError("Please fill in all required fields");
        return false;
      }
      if (password !== confirmPassword) { setError("Passwords do not match"); return false; }
      const pwErr = validatePassword(password);
      if (pwErr) { setError(pwErr); return false; }
      if (parseInt(age) < 18) { setError("You must be at least 18 years old"); return false; }
    }
    if (step === 2 && (!lifeGoals || !workEthic)) {
      setError("Please select your life goals and work ethic");
      return false;
    }
    if (step === 3 && (!conflictStyle || loveLanguages.length === 0)) {
      setError("Please select your conflict style and at least one love language");
      return false;
    }
    if (step === 4 && (!socialBattery || !idealWeekend)) {
      setError("Please complete all selections");
      return false;
    }
    if (step === 5 && (!relationshipGoal || !relationshipPace)) {
      setError("Please complete all selections");
      return false;
    }
    if (step === 6 && selectedHobbies.length < 3) {
      setError("Please select at least 3 interests");
      return false;
    }
    if (step === 8 && !humorType) {
      setError("Please select your humor type");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayValue = (arr: string[], setArr: (v: string[]) => void, val: string, max = 99) => {
    if (arr.includes(val)) {
      setArr(arr.filter((v) => v !== val));
    } else if (arr.length < max) {
      setArr([...arr, val]);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { first_name: firstName },
        },
      });

      if (authError) { setError(authError.message); setLoading(false); return; }

      if (authData.user) {
        const uid = authData.user.id;

        // Create profile
        await supabase.from("profiles").insert({
          user_id: uid,
          first_name: firstName,
          gender,
          age: parseInt(age),
          bio: `${lifeGoals ? `Life goal: ${lifeGoals}. ` : ""}${relationshipGoal ? `Looking for: ${relationshipGoal}.` : ""}`,
          tagline: `${socialBattery || ""} • ${relationshipGoal || ""}`,
          location,
        });

        // Add hobbies as interests
        if (selectedHobbies.length > 0) {
          await supabase.from("interests").insert(
            selectedHobbies.map((interest) => ({ user_id: uid, interest }))
          );
        }

        // Create match preferences
        await supabase.from("match_preferences").insert({
          user_id: uid,
          min_age: ageRange[0],
          max_age: ageRange[1],
          preferred_gender: preferredGender,
          preferred_location: location,
          show_nearby: showNearby,
        });

        // Save personality answers
        await supabase.from("personality_answers" as any).insert({
          user_id: uid,
          life_goals: lifeGoals,
          work_ethic: workEthic,
          ambition_level: ambitionLevel[0],
          conflict_style: conflictStyle,
          love_language: loveLanguages,
          social_battery: socialBattery,
          ideal_weekend: idealWeekend,
          relationship_goal: relationshipGoal,
          relationship_pace: relationshipPace,
          empathy_score: empathyScore[0],
          self_awareness: selfAwareness[0],
          emotional_openness: emotionalOpenness[0],
          humor_type: humorType,
          fun_activity: funActivities,
          dealbreakers,
        });

        toast({ title: "Account created!", description: "Welcome to VibeLink!" });
        navigate("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast({ title: "Error", description: "Could not sign up with Google", variant: "destructive" });
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const pageTitles = [
    "Account Basics",
    "Life & Values",
    "How You Communicate",
    "Social Battery",
    "Relationship Goals",
    "Interests & Hobbies",
    "Emotional Intelligence",
    "Humor & Fun",
    "Your Non-Negotiables",
    "Match Preferences",
  ];

  const CardChoice = ({ label, selected, onClick, emoji }: { label: string; selected: boolean; onClick: () => void; emoji?: string }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all font-medium text-sm ${
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-muted/30 hover:border-primary/50 text-foreground"
      }`}
    >
      {emoji && <span className="mr-2">{emoji}</span>}
      {label}
    </button>
  );

  const Chip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-border bg-muted/30 hover:border-primary/50 text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8 mt-20">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 shadow-2xl border-none bg-card/80 backdrop-blur-sm">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold mb-1">
                Join <span className="font-freestyle text-gradient-brand hover-glow">VibeLink</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Step {step} of {TOTAL_STEPS} — {pageTitles[step - 1]}
              </p>
            </div>

            <Progress value={progress} className="mb-6" />

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={step === TOTAL_STEPS ? handleSignUp : (e) => { e.preventDefault(); handleNext(); }}>

              {/* PAGE 1: Account Basics */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your name" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Age *</Label>
                      <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Your age" min="18" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="pl-10" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or sign up with</span></div>
                    </div>
                    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignUp}>
                      <Chrome className="mr-2 h-4 w-4" /> Continue with Google
                    </Button>
                  </div>
                </div>
              )}

              {/* PAGE 2: Life & Values */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-2">What drives you in life?</h2>
                  <div className="space-y-3">
                    <Label>My main life goal is *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: "career", label: "Career & Success", emoji: "💼" },
                        { val: "family", label: "Family & Relationships", emoji: "👨‍👩‍👧" },
                        { val: "adventure", label: "Adventure & Travel", emoji: "🌍" },
                        { val: "balance", label: "Work-Life Balance", emoji: "⚖️" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={lifeGoals === o.val} onClick={() => setLifeGoals(o.val)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>My work ethic is *</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: "workaholic", label: "Hustle mode", emoji: "🔥" },
                        { val: "balanced", label: "Balanced", emoji: "🌿" },
                        { val: "chill", label: "Easy-going", emoji: "😌" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={workEthic === o.val} onClick={() => setWorkEthic(o.val)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Ambition level: {ambitionLevel[0]}/10</Label>
                    <Slider value={ambitionLevel} onValueChange={setAmbitionLevel} min={1} max={10} step={1} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Go with the flow</span>
                      <span>Highly ambitious</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 3: Communication */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-2">How do you connect?</h2>
                  <div className="space-y-3">
                    <Label>When there's conflict, I tend to *</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: "direct", label: "Address it directly", emoji: "💬" },
                        { val: "compromise", label: "Find middle ground", emoji: "🤝" },
                        { val: "avoid", label: "Need space first", emoji: "🕊️" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={conflictStyle === o.val} onClick={() => setConflictStyle(o.val)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>My love languages (select all that apply) *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: "words", label: "Words of Affirmation", emoji: "💌" },
                        { val: "touch", label: "Physical Touch", emoji: "🤗" },
                        { val: "acts", label: "Acts of Service", emoji: "🛠️" },
                        { val: "time", label: "Quality Time", emoji: "⏰" },
                        { val: "gifts", label: "Gift Giving", emoji: "🎁" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={loveLanguages.includes(o.val)} onClick={() => toggleArrayValue(loveLanguages, setLoveLanguages, o.val)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 4: Social Battery */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-2">What's your social vibe?</h2>
                  <div className="space-y-3">
                    <Label>I identify as *</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: "introvert", label: "Introvert", emoji: "📚" },
                        { val: "ambivert", label: "Ambivert", emoji: "🔄" },
                        { val: "extrovert", label: "Extrovert", emoji: "🎉" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={socialBattery === o.val} onClick={() => setSocialBattery(o.val)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>My ideal weekend is *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: "home", label: "Cozy at home", emoji: "🛋️" },
                        { val: "outdoor", label: "Outdoors & nature", emoji: "🏔️" },
                        { val: "social", label: "Out with friends", emoji: "🍻" },
                        { val: "travel", label: "Spontaneous travel", emoji: "✈️" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={idealWeekend === o.val} onClick={() => setIdealWeekend(o.val)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5: Relationship Goals */}
              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-2">What are you looking for?</h2>
                  <div className="space-y-3">
                    <Label>I'm looking for *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: "casual", label: "Something casual", emoji: "☀️" },
                        { val: "serious", label: "Serious relationship", emoji: "💍" },
                        { val: "open", label: "Open to anything", emoji: "🌈" },
                        { val: "marriage", label: "Marriage & family", emoji: "👨‍👩‍👧" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={relationshipGoal === o.val} onClick={() => setRelationshipGoal(o.val)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>My preferred relationship pace is *</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: "slow", label: "Take it slow", emoji: "🐢" },
                        { val: "medium", label: "Steady & sure", emoji: "🚶" },
                        { val: "fast", label: "Jump right in", emoji: "🚀" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={relationshipPace === o.val} onClick={() => setRelationshipPace(o.val)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 6: Interests & Hobbies */}
              {step === 6 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold mb-1">What do you love doing?</h2>
                  <p className="text-sm text-muted-foreground mb-3">Select 3–10 interests ({selectedHobbies.length} selected)</p>
                  {Object.entries(HOBBY_CATEGORIES).map(([category, hobbies]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {hobbies.map((h) => (
                          <Chip
                            key={h}
                            label={h}
                            selected={selectedHobbies.includes(h)}
                            onClick={() => toggleArrayValue(selectedHobbies, setSelectedHobbies, h, 10)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAGE 7: Emotional Intelligence */}
              {step === 7 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-2">How emotionally aware are you?</h2>
                  {[
                    { label: "Empathy — I genuinely feel for others", val: empathyScore, setVal: setEmpathyScore },
                    { label: "Self-awareness — I understand my own emotions", val: selfAwareness, setVal: setSelfAwareness },
                    { label: "Emotional openness — I share how I feel", val: emotionalOpenness, setVal: setEmotionalOpenness },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <Label>{item.label}: {item.val[0]}/10</Label>
                      <Slider value={item.val} onValueChange={item.setVal} min={1} max={10} step={1} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Developing</span>
                        <span>Very high</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAGE 8: Humor & Fun */}
              {step === 8 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-2">What's your fun factor?</h2>
                  <div className="space-y-3">
                    <Label>My humor style is *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: "dry", label: "Dry & subtle", emoji: "🧐" },
                        { val: "sarcastic", label: "Sarcastic wit", emoji: "😏" },
                        { val: "wholesome", label: "Wholesome & warm", emoji: "🌻" },
                        { val: "dark", label: "Dark humor", emoji: "🦇" },
                      ].map((o) => (
                        <CardChoice key={o.val} label={o.label} emoji={o.emoji} selected={humorType === o.val} onClick={() => setHumorType(o.val)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>How I unwind (pick any)</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Netflix binge", "Long walks", "Cooking", "Reading", "Gaming", "Music", "Gym", "Socializing", "Meditation", "Art"].map((a) => (
                        <Chip key={a} label={a} selected={funActivities.includes(a)} onClick={() => toggleArrayValue(funActivities, setFunActivities, a)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 9: Deal-breakers */}
              {step === 9 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold mb-1">Your non-negotiables</h2>
                  <p className="text-sm text-muted-foreground mb-3">What are absolute deal-breakers for you? (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {DEALBREAKER_OPTIONS.map((d) => (
                      <Chip key={d} label={d} selected={dealbreakers.includes(d)} onClick={() => toggleArrayValue(dealbreakers, setDealbreakers, d)} />
                    ))}
                  </div>
                </div>
              )}

              {/* PAGE 10: Match Preferences */}
              {step === 10 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-2">Who are you looking to meet?</h2>
                  <div className="space-y-3">
                    <Label>Age Range: {ageRange[0]} – {ageRange[1]}</Label>
                    <Slider value={ageRange} onValueChange={setAgeRange} min={18} max={80} step={1} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender Preference</Label>
                    <select value={preferredGender} onChange={(e) => setPreferredGender(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="pl-10" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showNearby" checked={showNearby} onCheckedChange={(checked) => setShowNearby(checked as boolean)} />
                    <Label htmlFor="showNearby" className="cursor-pointer">Show me people near me</Label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
                {step < TOTAL_STEPS ? (
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90" disabled={loading}>
                    {loading ? "Creating Account..." : "Find My Vibe ✨"}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignUp;
