import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { SendHorizonal, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateChatCompletion, OpenAIMessage } from "@/services/openai-service";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [conversationHistory, setConversationHistory] = useState<OpenAIMessage[]>([]);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      const aiResponse = await generateChatCompletion(userMessage.content, conversationHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      
      const aiOpenAIMessage: OpenAIMessage = {
        role: "assistant",
        content: aiResponse,
      };
      
      setConversationHistory([...updatedHistory, aiOpenAIMessage]);
      setMessages((prev) => [...prev, aiMessage]);
      
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
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-2">Welcome to Whisper Well</h3>
                <p className="text-muted-foreground max-w-md px-4 sm:px-0">
                  Your personal AI assistant. Start a conversation by typing a message below. ✨
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
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <Input
            type="text"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 py-5 sm:py-6 bg-muted text-sm sm:text-base"
            disabled={isLoading}
          />
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
        </form>
      </div>
    </div>
  );
}
