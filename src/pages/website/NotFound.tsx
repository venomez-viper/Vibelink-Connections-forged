import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/website/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="text-center max-w-md">
          <h1 className="mb-4 text-8xl font-bold text-primary">404</h1>
          <h2 className="mb-4 text-3xl font-bold text-foreground">Page Not Found</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Oops! The page you're looking for doesn't exist. Let's get you back on track.
          </p>
          <Button size="lg" asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
