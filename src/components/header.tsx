
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Heart, MessageCircle, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 fill-primary stroke-primary animate-pulse-slow" />
          <span className="text-xl font-bold gradient-text">Whisper Well</span>
        </Link>
        <div className="flex items-center gap-4">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 pt-10">
                <nav className="flex flex-col space-y-4 p-4">
                  <Link to="/" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    Home
                  </Link>
                  <Link to="/chat" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <nav className="hidden md:flex items-center gap-6 mr-4">
              <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/chat" className="text-sm font-medium transition-colors hover:text-primary">
                Chat
              </Link>
            </nav>
          )}
          <ThemeToggle />
          <Button size="sm" className="hidden md:flex gap-2 items-center" asChild>
            <Link to="/chat">
              <MessageCircle className="h-4 w-4" />
              <span>New Chat</span>
            </Link>
          </Button>
          {isMobile && (
            <Button size="sm" className="md:hidden w-10 h-10 p-0" asChild>
              <Link to="/chat">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">New Chat</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
