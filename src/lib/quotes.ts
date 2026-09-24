export type QuoteCategory =
  | 'home'
  | 'progress'
  | 'squad'
  | 'activity'
  | 'empty_workout'
  | 'empty_squad'
  | 'challenge'
  | 'profile'
  | 'general';

export interface Quote {
  text: string;
  author?: string;
  category: QuoteCategory;
}

export const CYNC_QUOTES: Quote[] = [
  // Home
  { text: 'Small steps. Every single day.', category: 'home' },
  { text: 'Consistency is quiet momentum.', category: 'home' },
  { text: 'Show up for yourself today.', category: 'home' },

  // Progress
  { text: 'Consistency compounds.', category: 'progress' },
  { text: 'What gets measured gets cared for.', category: 'progress' },
  { text: 'Progress is built in the ordinary days.', category: 'progress' },

  // Squad
  { text: 'Show up together.', category: 'squad' },
  { text: 'We go further when we walk alongside others.', category: 'squad' },
  { text: 'Accountability is care in action.', category: 'squad' },

  // Activity
  { text: 'Every session counts.', category: 'activity' },
  { text: 'The hardest part is lacing up.', category: 'activity' },
  { text: 'Honoring the commitment you made yesterday.', category: 'activity' },

  // Empty states
  { text: 'One session is enough to begin.', category: 'empty_workout' },
  { text: 'Every journey starts with one day.', category: 'empty_workout' },
  { text: 'Progress is better together.', category: 'empty_squad' },
  { text: 'Find your people, build your rhythm.', category: 'empty_squad' },

  // Challenge
  { text: 'A little effort, repeated often.', category: 'challenge' },
  { text: 'Together, the distance feels shorter.', category: 'challenge' },

  // Profile
  { text: 'Becoming takes time.', category: 'profile' },
  { text: 'Quiet dedication speaks for itself.', category: 'profile' },

  // General
  { text: 'Stay consistent. Stay connected.', category: 'general' },
];

/**
 * Returns a primary curated quote for a specific context
 */
export function getQuoteForCategory(category: QuoteCategory): string {
  const matching = CYNC_QUOTES.filter((q) => q.category === category);
  return matching.length > 0 ? matching[0].text : 'Stay consistent. Stay connected.';
}

