import { OpenAIMessage } from './openai-service';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function handleChatRequest(
  prompt: string,
  previousMessages: OpenAIMessage[] = []
): Promise<string> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

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
      const errorData = await response.json() as OpenAIResponse;
      throw new Error(errorData.error?.message || 'Failed to generate response');
    }

    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
} 