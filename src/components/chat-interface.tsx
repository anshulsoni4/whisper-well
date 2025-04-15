
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Bot, User, Sparkles, Mic, BookHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  generateChatCompletion, 
  detectMood, 
  generateJournalPrompt, 
  OpenAIMessage, 
  JournalEntry 
} from "@/services/openai-service";
import { 
  getJournalEntries, 
  saveJournalEntry, 
  getTodaysEntries, 
  getWeeklyEntries, 
  getOnThisDayEntries,
  extractCommonThemes
} from "@/services/journal-service";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  tags?: string[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isJournalMode, setIsJournalMode] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [conversationHistory, setConversationHistory] = useState<OpenAIMessage[]>([]);
  const isMobile = useIsMobile();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load journal entries on component mount
  useEffect(() => {
    const entries = getJournalEntries();
    setJournalEntries(entries);
    
    // Display welcome message with journal prompt if no messages exist
    if (messages.length === 0) {
      generateWelcomeMessage();
    }
    
    // Display "On This Day" message if applicable
    checkForOnThisDayMemories();
  }, []);

  const generateWelcomeMessage = async () => {
    try {
      const todayEntries = getTodaysEntries();
      
      // If no entries today, generate a prompt
      if (todayEntries.length === 0) {
        const prompt = await generateJournalPrompt(journalEntries);
        
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: `Welcome to your journal. ${prompt}`,
          sender: "ai",
          timestamp: new Date(),
        };
        
        setMessages([welcomeMessage]);
        
        // Add to conversation history
        setConversationHistory([
          { 
            role: "assistant", 
            content: welcomeMessage.content 
          }
        ]);
      }
    } catch (error) {
      console.error("Error generating welcome message:", error);
      // Fallback welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: "Welcome to your journal. How are you feeling today?",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      setConversationHistory([
        { 
          role: "assistant", 
          content: welcomeMessage.content 
        }
      ]);
    }
  };

  const checkForOnThisDayMemories = () => {
    const onThisDayEntries = getOnThisDayEntries();
    
    if (onThisDayEntries.length > 0) {
      // Pick a random entry from previous years on this day
      const randomIndex = Math.floor(Math.random() * onThisDayEntries.length);
      const pastEntry = onThisDayEntries[randomIndex];
      const pastDate = new Date(pastEntry.date);
      const yearsAgo = new Date().getFullYear() - pastDate.getFullYear();
      
      const memoryMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `💫 On this day ${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago, you wrote: "${pastEntry.content.substring(0, 100)}${pastEntry.content.length > 100 ? '...' : ''}" Isn't it interesting to see how things change?`,
        sender: "ai",
        timestamp: new Date(),
      };
      
      // Add memory message after a small delay
      setTimeout(() => {
        setMessages(prev => [...prev, memoryMessage]);
        setConversationHistory(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: memoryMessage.content 
          }
        ]);
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const userOpenAIMessage: OpenAIMessage = {
        role: "user",
        content: userMessage.content,
      };
      
      const updatedHistory = [...conversationHistory, userOpenAIMessage];
      
      // If in journal mode, process the entry
      if (isJournalMode) {
        // Analyze mood
        const detectedMood = await detectMood(userMessage.content);
        setCurrentMood(detectedMood);
        
        // Extract potential tags (simple implementation)
        const potentialTags = extractTagsFromEntry(userMessage.content);
        
        // Save journal entry
        const newEntry = saveJournalEntry(userMessage.content, detectedMood, potentialTags);
        setJournalEntries(prev => [newEntry, ...prev]);
        
        // Create response with mood analysis
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: detectedMood,
          sender: "ai",
          timestamp: new Date(),
          tags: potentialTags
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        const aiOpenAIMessage: OpenAIMessage = {
          role: "assistant",
          content: detectedMood,
        };
        
        setConversationHistory([...updatedHistory, aiOpenAIMessage]);
        setIsJournalMode(false);
      } else {
        // Normal chat mode - use the OpenAI API
        const aiResponse = await generateChatCompletion(
          userMessage.content, 
          conversationHistory, 
          journalEntries
        );
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: "ai",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        const aiOpenAIMessage: OpenAIMessage = {
          role: "assistant",
          content: aiResponse,
        };
        
        setConversationHistory([...updatedHistory, aiOpenAIMessage]);
        
        // Check if this is a weekly summary request on Sunday
        const isWeeklySummary = new Date().getDay() === 0 && 
          userMessage.content.toLowerCase().includes('week');
          
        if (isWeeklySummary) {
          // Refresh journal entries to include the latest
          setJournalEntries(getJournalEntries());
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractTagsFromEntry = (content: string): string[] => {
    // Simple implementation - extract words with strong emotional connotations
    // In a real implementation, you would use NLP or the OpenAI API
    const emotionalWords = [
      'happy', 'sad', 'angry', 'anxious', 'excited', 'tired', 'grateful',
      'frustrated', 'calm', 'overwhelmed', 'hopeful', 'motivated', 'inspired',
      'worried', 'content', 'stressed', 'relaxed', 'proud', 'disappointed'
    ];
    
    const tags: string[] = [];
    const contentLower = content.toLowerCase();
    
    emotionalWords.forEach(word => {
      if (contentLower.includes(word)) {
        tags.push(word);
      }
    });
    
    return tags.slice(0, 3); // Limit to 3 tags
  };

  const toggleJournalMode = () => {
    setIsJournalMode(!isJournalMode);
    
    if (!isJournalMode) {
      toast({
        title: "Journal Mode Activated",
        description: "Your next message will be saved as a journal entry.",
        variant: "default",
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pt-16">
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full p-2 sm:p-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pt-20 pb-8 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookHeart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-2 font-poppins">Welcome to Your Journal</h3>
                <p className="text-muted-foreground max-w-md px-4 sm:px-0">
                  Your personal AI journaling companion. Start writing or ask for a prompt to begin. ✨
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2 sm:gap-3 transition-all duration-300 animate-fade-in",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === "ai" && (
                    <Avatar className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 sm:px-4 sm:py-2 max-w-[85%] sm:max-w-[80%] md:max-w-[70%]",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "glass"
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words text-sm sm:text-base">
                      {message.content}
                    </div>
                    <div className="flex justify-between items-center">
                      <div
                        className={cn(
                          "text-[10px] sm:text-xs mt-1",
                          message.sender === "user"
                            ? "text-primary-foreground/70"
                            : "text-foreground/50"
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                      
                      {message.tags && message.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {message.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="text-[10px] bg-primary/20 text-primary-foreground/90 px-1.5 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-full bg-secondary">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Avatar>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start gap-2 sm:gap-3 animate-fade-in">
                <Avatar className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white animate-pulse" />
                </Avatar>
                <div className="glass rounded-2xl px-3 py-2 sm:px-4 sm:py-2">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-2 sm:p-4 border-t bg-background/80 backdrop-blur-md">
        <form
          onSubmit={handleSendMessage}
          className="flex flex-col gap-2 max-w-3xl mx-auto"
        >
          {isJournalMode ? (
            <Textarea
              placeholder="Write your journal entry here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] w-full text-sm sm:text-base resize-none p-3"
              disabled={isLoading}
            />
          ) : (
            <Input
              type="text"
              placeholder="Send a message or start journaling..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 py-5 sm:py-6 bg-muted text-sm sm:text-base"
              disabled={isLoading}
            />
          )}
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleJournalMode}
              className={cn(
                "gap-2",
                isJournalMode && "bg-primary/20"
              )}
            >
              <BookHeart className="h-4 w-4" />
              <span>{isJournalMode ? "Cancel Journaling" : "Journal Mode"}</span>
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className={cn(
                  "shrink-0 rounded-full size-9 sm:size-10",
                  !input.trim() ? "opacity-50" : ""
                )}
              >
                <SendHorizonal className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
