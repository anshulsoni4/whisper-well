import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsForm() {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">API Configuration</h2>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            The OpenAI API key is configured through environment variables.
            Please set your API key in the <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file.
          </p>
          <p className="text-sm text-muted-foreground">
            Example: <code className="bg-muted px-1 py-0.5 rounded">OPENAI_API_KEY=your_api_key_here</code>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Check className="h-5 w-5 text-green-500" />
          <span className="text-sm text-muted-foreground">
            API key is securely stored in environment variables
          </span>
        </div>
      </div>
    </Card>
  );
}
