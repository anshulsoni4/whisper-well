// This service handles the OpenAI API communication through our secure API route

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

export async function generateChatCompletion(
  prompt: string,
  previousMessages: OpenAIMessage[] = []
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant named Whisper Well. Be concise, friendly, and supportive.' },
          ...previousMessages,
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat completion error:', error);
    throw new Error('Failed to generate response. Please check your API key and try again.');
  }
}
