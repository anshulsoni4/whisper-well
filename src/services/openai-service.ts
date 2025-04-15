
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

export interface JournalEntry {
  content: string;
  date: Date;
  mood?: string;
  tags?: string[];
}

// Function to detect mood from journal entry
export async function detectMood(entry: string): Promise<string> {
  try {
    // Check if API key exists in environment variables
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const messages: OpenAIMessage[] = [
      { 
        role: 'system', 
        content: 'You are a compassionate AI assistant that analyzes emotional tone in journal entries. Provide a brief, warm summary of the emotional tone in a single sentence. Include one relevant emoji. Be supportive and gentle.' 
      },
      { role: 'user', content: `Analyze the emotional tone in this journal entry: "${entry}"` }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 150,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze mood');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error detecting mood:', error);
    return "I'm not able to analyze the mood right now, but I appreciate you sharing your thoughts.";
  }
}

// Function to generate a personalized journal prompt
export async function generateJournalPrompt(previousEntries?: JournalEntry[]): Promise<string> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const previousMoods = previousEntries?.map(entry => entry.mood).join(', ') || 'No previous entries';

    const messages: OpenAIMessage[] = [
      { 
        role: 'system', 
        content: 'You are a compassionate AI journaling companion. Generate a warm, thoughtful journaling prompt based on the day of the week and previous moods if available. Keep it concise and supportive.' 
      },
      { 
        role: 'user', 
        content: `Generate a journaling prompt for ${dayOfWeek}. Previous mood trends: ${previousMoods}` 
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 150,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate prompt');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating prompt:', error);
    return "What's on your mind today? I'm here to listen.";
  }
}

// Main function for generating chat completion
export async function generateChatCompletion(
  prompt: string,
  previousMessages: OpenAIMessage[] = [],
  journalEntries: JournalEntry[] = []
): Promise<string> {
  try {
    // Check if API key exists in environment variables
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Check if it's a request for weekly summary (Sunday)
    const isWeeklySummaryRequest = new Date().getDay() === 0 && 
      (prompt.toLowerCase().includes('week') || prompt.toLowerCase().includes('summary'));
    
    // Check if it's a request to chat with past self
    const isPastSelfRequest = prompt.toLowerCase().includes('what was i like') || 
      prompt.toLowerCase().includes('summarize') || 
      prompt.toLowerCase().includes('past entries');

    // Process journal entries as context if needed
    let journalContext = "";
    if (isWeeklySummaryRequest || isPastSelfRequest) {
      journalContext = "Previous journal entries:\n" + 
        journalEntries.map(entry => 
          `Date: ${entry.date.toLocaleDateString()}\nEntry: ${entry.content}\nMood: ${entry.mood || 'Unknown'}\n---`
        ).join('\n');
    }

    // Prepare conversation history with appropriate system message
    const systemMessage = {
      role: 'system' as const,
      content: `You are a compassionate, reflective, and emotionally intelligent AI journaling companion named Whisper Well. 
      You help users reflect, vent, heal, and grow by engaging with them in a supportive, warm, and non-judgmental tone.
      
      Use these guidelines:
      - Be thoughtful, gentle, and non-pushy
      - Use emojis lightly to enhance warmth
      - If the user is sharing a journal entry, analyze their emotional tone in a friendly way
      - Provide affirmations based on their mood
      - Track recurring goals or themes they mention
      - If it's Sunday, offer a weekly emotional summary
      - If asked about past entries, provide reflective summaries
      - Add a single #hashtag emotional tag at the end of your responses
      
      ${journalContext}`
    };

    const messages: OpenAIMessage[] = [
      systemMessage,
      ...previousMessages,
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
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
    throw new Error('Failed to generate response. Please check your API key and try again.');
  }
}
