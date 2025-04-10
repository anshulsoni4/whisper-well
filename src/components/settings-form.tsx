
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Key, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsForm() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you'd securely store this
    localStorage.setItem("openai-api-key", apiKey);
    setIsSaved(true);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved.",
      variant: "default",
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="p-6 space-y-6 glass">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">API Configuration</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your OpenAI API key to enable chat completions.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder="sk-..."
                  className="pr-10"
                />
                {isSaved && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <Button 
                onClick={saveApiKey} 
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-900 p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-amber-800 dark:text-amber-300">
              Your API key is stored locally and is never sent to our servers. It is only used to
              communicate directly with OpenAI's API.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
