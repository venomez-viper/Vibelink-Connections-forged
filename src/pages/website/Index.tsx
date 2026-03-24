import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/app/AppHeader";
import Hero from "@/components/website/Hero";
import Features from "@/components/website/Features";
import Footer from "@/components/website/Footer";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  return (
    <div className="app-theme min-h-screen">
      <AppHeader />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
