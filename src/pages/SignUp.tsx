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
import { ArrowRight, ArrowLeft, User, Mail, Lock, Heart, MapPin, Chrome } from "lucide-react";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Account Info
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  // Step 2: Interests & Personality
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");

  // Step 3: Match Preferences
  const [ageRange, setAgeRange] = useState([18, 50]);
  const [preferredGender, setPreferredGender] = useState("");
  const [location, setLocation] = useState("");
  const [showNearby, setShowNearby] = useState(false);

  const validateStep1 = () => {
    if (!firstName || !email || !password || !confirmPassword || !gender || !age) {
      setError("Please fill in all required fields");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (parseInt(age) < 18) {
      setError("You must be at least 18 years old");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && !validateStep1()) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            first_name: firstName,
            email,
            gender,
            age: parseInt(age),
            bio,
            tagline: bio,
            location,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        // Add interests
        if (interests) {
          const interestArray = interests.split(",").map((i) => i.trim());
          const interestRecords = interestArray.map((interest) => ({
            user_id: authData.user.id,
            interest,
          }));
          
          const { error: interestsError } = await supabase
            .from("interests")
            .insert(interestRecords);

          if (interestsError) {
            console.error("Interests creation error:", interestsError);
          }
        }

        // Create match preferences
        const { error: prefsError } = await supabase
          .from("match_preferences")
          .insert({
            user_id: authData.user.id,
            min_age: ageRange[0],
            max_age: ageRange[1],
            preferred_gender: preferredGender,
            preferred_location: location,
            show_nearby: showNearby,
          });

        if (prefsError) {
          console.error("Preferences creation error:", prefsError);
        }

        toast({
          title: "Account created successfully!",
          description: "Welcome to VibeLink!",
        });

        navigate("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: "Could not sign up with Google",
        variant: "destructive",
      });
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 mt-20">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 shadow-2xl border-none bg-card/80 backdrop-blur-sm">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">
                Join <span className="font-freestyle text-gradient-brand hover-glow">VibeLink</span> — Create Your Profile
              </h1>
              <p className="text-muted-foreground text-sm">Step {step} of 3</p>
            </div>

            <Progress value={progress} className="mb-8" />

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={step === 3 ? handleSignUp : (e) => { e.preventDefault(); handleNext(); }}>
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Your name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Your age"
                        min="18"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignUp}
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Continue with Google
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Interests & Personality</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interests">Your Interests</Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="interests"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="Music, Travel, Fitness (comma separated)"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Separate interests with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Describe yourself in one line</Label>
                    <Input
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Adventure seeker with a love for coffee and good conversations"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground text-right">{bio.length}/100</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Match Preferences</h2>
                  
                  <div className="space-y-4">
                    <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
                    <Slider
                      value={ageRange}
                      onValueChange={setAgeRange}
                      min={18}
                      max={80}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredGender">Gender Preference</Label>
                    <select
                      id="preferredGender"
                      value={preferredGender}
                      onChange={(e) => setPreferredGender(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showNearby"
                      checked={showNearby}
                      onCheckedChange={(checked) => setShowNearby(checked as boolean)}
                    />
                    <Label htmlFor="showNearby" className="cursor-pointer">
                      Show me people near me
                    </Label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
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
