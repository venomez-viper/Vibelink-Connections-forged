import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppHeader from "@/components/app/AppHeader";
import Footer from "@/components/website/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AnimatedBackground from "@/components/ui/animated-background";
import AuthCard from "@/components/ui/auth-card";

// Brand icons — lucide-react does not ship these
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.378-3.066c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
  </svg>
);

// ─── Auth logic (unchanged from previous version) ───────────────────────────
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid credentials, please try again.");
        setLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: "Could not sign in with Google",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn(email, password);
  };

  // ─── UI layout: matches signup page structure (Header + background + card + Footer) ─
  return (
    <div className="app-theme min-h-screen flex flex-col animated-auth-bg">
      <AppHeader />

      <div className="relative flex-1 flex items-center justify-center px-4 py-8 mt-20">
        <AnimatedBackground isDarkMode={true} />

        <AuthCard mode="login">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display mb-1">
              Welcome Back to{" "}
              <span className="font-freestyle text-gradient-brand hover-glow">VibeLink</span>
            </h1>
            <p className="text-muted-foreground text-sm">Your vibe finds its match.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-center bg-destructive/10 border border-destructive/30 text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 focus-visible:ring-primary/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <span className="flex-1 h-px bg-white/10" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or continue with</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all"
              aria-label="Sign in with Google"
            >
              <GoogleIcon />
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
              aria-label="Sign in with Instagram"
            >
              <InstagramIcon />
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
              aria-label="Sign in with Apple"
            >
              <AppleIcon />
            </button>
          </div>

          {/* Sign up link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </AuthCard>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
