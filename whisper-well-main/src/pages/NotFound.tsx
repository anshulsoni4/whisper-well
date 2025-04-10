
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <div className="mb-6 inline-block">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">404</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Page not found</h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
