
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircleIcon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="mb-6 relative">
            <Heart className="h-16 w-16 fill-primary stroke-primary animate-pulse-slow" />
            <div className="absolute -right-2 -top-2 bg-primary rounded-full p-1">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="gradient-text animate-gradient">Whisper Well</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
            Share your thoughts, questions, and ideas in a whisper. Get AI-powered
            responses with just a message. ✨
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/chat">
                <MessageCircleIcon className="h-5 w-5" />
                Start Whispering
              </Link>
            </Button>
          </div>
          
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Responses</h3>
              <p className="text-muted-foreground">
                Get intelligent responses to your queries using advanced AI models.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <MessageCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Natural Conversations</h3>
              <p className="text-muted-foreground">
                Enjoy fluid, human-like conversations with contextual understanding.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Beautiful Interface</h3>
              <p className="text-muted-foreground">
                Enjoy a delightful chat experience with elegant design and smooth animations.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 bg-background/80 backdrop-blur-md">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Whisper Well. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
