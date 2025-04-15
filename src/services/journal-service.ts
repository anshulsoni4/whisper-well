
import { JournalEntry } from './openai-service';

// In a real app, this would be stored in a database
// For now, we'll use localStorage for simplicity
const JOURNAL_STORAGE_KEY = 'whisper-well-journal-entries';

// Initialize journal entries from localStorage
export function getJournalEntries(): JournalEntry[] {
  try {
    const storedEntries = localStorage.getItem(JOURNAL_STORAGE_KEY);
    return storedEntries ? JSON.parse(storedEntries) : [];
  } catch (error) {
    console.error('Error retrieving journal entries:', error);
    return [];
  }
}

// Save a new journal entry
export function saveJournalEntry(content: string, mood?: string, tags?: string[]): JournalEntry {
  try {
    const entries = getJournalEntries();
    const newEntry: JournalEntry = {
      content,
      date: new Date(),
      mood,
      tags
    };
    
    const updatedEntries = [newEntry, ...entries];
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updatedEntries));
    
    return newEntry;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw new Error('Failed to save journal entry');
  }
}

// Get entries from a specific time period
export function getEntriesByDate(startDate: Date, endDate: Date): JournalEntry[] {
  const entries = getJournalEntries();
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

// Get entries from today
export function getTodaysEntries(): JournalEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getEntriesByDate(today, tomorrow);
}

// Get entries from the past week
export function getWeeklyEntries(): JournalEntry[] {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return getEntriesByDate(oneWeekAgo, today);
}

// Get entries from the same day in previous years (for "On This Day" feature)
export function getOnThisDayEntries(): JournalEntry[] {
  const today = new Date();
  const entries = getJournalEntries();
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getDate() === today.getDate() && 
           entryDate.getMonth() === today.getMonth() && 
           entryDate.getFullYear() < today.getFullYear();
  });
}

// Extract common themes or goals from recent entries
export function extractCommonThemes(entries: JournalEntry[] = getWeeklyEntries()): string[] {
  // This is a placeholder - in a real implementation, you would use 
  // the OpenAI API to analyze entries and extract themes
  const commonThemes: string[] = [];
  
  // Get all tags from entries
  const allTags = entries
    .filter(entry => entry.tags && entry.tags.length > 0)
    .flatMap(entry => entry.tags || []);
  
  // Count occurrences of each tag
  const tagCounts: Record<string, number> = {};
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  
  // Find tags that appear more than once
  Object.entries(tagCounts).forEach(([tag, count]) => {
    if (count > 1) {
      commonThemes.push(tag);
    }
  });
  
  return commonThemes;
}
