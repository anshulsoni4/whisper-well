
// This service handles the OpenAI API communication

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: OpenAIMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
}

// API key is stored as a constant and not exposed to the client through environment variables
// Note: In production, this should be handled by a backend service
const API_KEY = "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";

export async function generateChatCompletion(
  prompt: string,
  previousMessages: OpenAIMessage[] = []
): Promise<string> {
  try {
    // Prepare conversation history
    const messages: OpenAIMessage[] = [
      { role: 'system', content: 'You are a helpful assistant named Whisper Well. Be concise, friendly, and supportive.' },
      ...previousMessages,
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the recommended fast and cheap model
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API response error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    return "Sorry, there was an error generating a response. Please try again.";
  }
}
