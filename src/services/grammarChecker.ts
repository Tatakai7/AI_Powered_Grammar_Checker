import { Suggestion } from '../lib/supabase';

export interface GrammarError {
  type: 'grammar' | 'spelling' | 'style' | 'punctuation' | 'clarity';
  original: string;
  suggestion: string;
  explanation: string;
  start: number;
  end: number;
  alternatives?: string[];
}

const grammarRules = [
  {
    pattern: /\btheir\s+is\b/gi,
    type: 'grammar' as const,
    explanation: 'Use "there is" instead of "their is"',
    getSuggestion: (match: string) => match.replace(/their/i, 'there'),
  },
  {
    pattern: /\byour\s+(going|doing|coming)\b/gi,
    type: 'grammar' as const,
    explanation: 'Use "you\'re" (you are) instead of "your"',
    getSuggestion: (match: string) => match.replace(/your/i, 'you\'re'),
  },
  {
    pattern: /\bits\s+a\s+\w+\s+(thing|idea|concept)\b/gi,
    type: 'clarity' as const,
    explanation: 'Consider being more specific',
    getSuggestion: (match: string) => match,
    alternatives: ['This is important', 'This matters', 'This is significant'],
  },
  {
    pattern: /\b(very|really|actually)\s+/gi,
    type: 'style' as const,
    explanation: 'Consider removing filler words for stronger writing',
    getSuggestion: (match: string) => '',
  },
  {
    pattern: /\bshould\s+of\b/gi,
    type: 'grammar' as const,
    explanation: 'Use "should have" instead of "should of"',
    getSuggestion: (match: string) => 'should have',
  },
  {
    pattern: /\bcould\s+of\b/gi,
    type: 'grammar' as const,
    explanation: 'Use "could have" instead of "could of"',
    getSuggestion: (match: string) => 'could have',
  },
  {
    pattern: /\balot\b/gi,
    type: 'spelling' as const,
    explanation: 'Correct spelling is "a lot" (two words)',
    getSuggestion: () => 'a lot',
  },
  {
    pattern: /\b(,)\s*([A-Z])/g,
    type: 'punctuation' as const,
    explanation: 'Consider using a period or semicolon before starting a new sentence',
    getSuggestion: (match: string) => match.replace(',', '.'),
  },
  {
    pattern: /\b(However|Therefore|Moreover|Furthermore)\s+/g,
    type: 'punctuation' as const,
    explanation: 'Transition words at the start of a sentence should be followed by a comma',
    getSuggestion: (match: string) => match.trim() + ', ',
  },
  {
    pattern: /([.!?])[a-z]/g,
    type: 'grammar' as const,
    explanation: 'Start new sentence with a capital letter',
    getSuggestion: (match: string) => match.charAt(0) + match.charAt(1).toUpperCase(),
  },
];

const synonymDatabase: Record<string, string[]> = {
  good: ['excellent', 'great', 'fine', 'wonderful', 'superb'],
  bad: ['poor', 'unfavorable', 'negative', 'inferior'],
  big: ['large', 'substantial', 'considerable', 'significant'],
  small: ['tiny', 'minor', 'compact', 'modest'],
  happy: ['joyful', 'delighted', 'pleased', 'content'],
  sad: ['unhappy', 'sorrowful', 'melancholy', 'dejected'],
  important: ['significant', 'crucial', 'vital', 'essential'],
  said: ['stated', 'mentioned', 'remarked', 'expressed', 'noted'],
};

export function analyzeText(text: string): GrammarError[] {
  const errors: GrammarError[] = [];

  grammarRules.forEach((rule) => {
    let match;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      const original = match[0];
      const start = match.index;
      const end = start + original.length;

      errors.push({
        type: rule.type,
        original,
        suggestion: rule.getSuggestion(original),
        explanation: rule.explanation,
        start,
        end,
        alternatives: rule.alternatives,
      });
    }
  });

  const words = text.match(/\b\w+\b/g) || [];
  words.forEach((word) => {
    const lowerWord = word.toLowerCase();
    if (synonymDatabase[lowerWord]) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'g');
      let match;

      while ((match = wordRegex.exec(text)) !== null) {
        errors.push({
          type: 'style',
          original: word,
          suggestion: word,
          explanation: `Consider using a more specific word`,
          start: match.index,
          end: match.index + word.length,
          alternatives: synonymDatabase[lowerWord],
        });
      }
    }
  });

  return errors.sort((a, b) => a.start - b.start);
}

export function getSynonyms(word: string): string[] {
  return synonymDatabase[word.toLowerCase()] || [];
}

export function applySuggestion(
  text: string,
  error: GrammarError
): string {
  return (
    text.substring(0, error.start) +
    error.suggestion +
    text.substring(error.end)
  );
}
