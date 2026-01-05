const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

let model;

async function loadModel() {
  if (!model) {
    model = await use.load();
  }
  return model;
}

const grammarRules = [
  {
    pattern: /\btheir\s+is\b/gi,
    type: 'grammar',
    explanation: 'Use "there is" instead of "their is"',
    getSuggestion: (match) => match.replace(/their/i, 'there'),
  },
  {
    pattern: /\byour\s+(going|doing|coming)\b/gi,
    type: 'grammar',
    explanation: 'Use "you\'re" (you are) instead of "your"',
    getSuggestion: (match) => match.replace(/your/i, 'you\'re'),
  },
  {
    pattern: /\bits\s+a\s+\w+\s+(thing|idea|concept)\b/gi,
    type: 'clarity',
    explanation: 'Consider being more specific',
    getSuggestion: (match) => match,
    alternatives: ['This is important', 'This matters', 'This is significant'],
  },
  {
    pattern: /\b(very|really|actually)\s+/gi,
    type: 'style',
    explanation: 'Consider removing filler words for stronger writing',
    getSuggestion: (match) => '',
  },
  {
    pattern: /\bshould\s+of\b/gi,
    type: 'grammar',
    explanation: 'Use "should have" instead of "should of"',
    getSuggestion: () => 'should have',
  },
  {
    pattern: /\bcould\s+of\b/gi,
    type: 'grammar',
    explanation: 'Use "could have" instead of "could of"',
    getSuggestion: () => 'could have',
  },
  {
    pattern: /\balot\b/gi,
    type: 'spelling',
    explanation: 'Correct spelling is "a lot" (two words)',
    getSuggestion: () => 'a lot',
  },
  {
    pattern: /\b(,)\s*([A-Z])/g,
    type: 'punctuation',
    explanation: 'Consider using a period or semicolon before starting a new sentence',
    getSuggestion: (match) => match.replace(',', '.'),
  },
  {
    pattern: /\b(However|Therefore|Moreover|Furthermore)\s+/g,
    type: 'punctuation',
    explanation: 'Transition words at the start of a sentence should be followed by a comma',
    getSuggestion: (match) => match.trim() + ', ',
  },
  {
    pattern: /([.!?])[a-z]/g,
    type: 'grammar',
    explanation: 'Start new sentence with a capital letter',
    getSuggestion: (match) => match.charAt(0) + match.charAt(1).toUpperCase(),
  },
];

const synonymDatabase = {
  good: ['excellent', 'great', 'fine', 'wonderful', 'superb'],
  bad: ['poor', 'unfavorable', 'negative', 'inferior'],
  big: ['large', 'substantial', 'considerable', 'significant'],
  small: ['tiny', 'minor', 'compact', 'modest'],
  happy: ['joyful', 'delighted', 'pleased', 'content'],
  sad: ['unhappy', 'sorrowful', 'melancholy', 'dejected'],
  important: ['significant', 'crucial', 'vital', 'essential'],
  said: ['stated', 'mentioned', 'remarked', 'expressed', 'noted'],
};

async function analyzeText(text) {
  const errors = [];

  // Regex-based checks
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

  // Synonym suggestions
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

  // NLP-based enhancements (placeholder for now)
  // In a full implementation, use the model for better suggestions

  return errors.sort((a, b) => a.start - b.start);
}

async function getSynonyms(word) {
  // Use Tensorflow.js for better synonyms
  await loadModel();
  const embeddings = await model.embed([word]);
  // For simplicity, return static synonyms; in real implementation, find similar words
  return synonymDatabase[word.toLowerCase()] || [];
}

module.exports = { analyzeText, getSynonyms };
