export const BANNED_QUESTION_FIRST_PATTERNS = [
  'Which do you want next',
  'Do you want me to',
  'Pick one',
  'Tell me which option',
  'Would you like me to',
  'Before I proceed',
  'two quick confirmations',
  'I need your confirmation',
];

export function scanForQuestionFirst(text) {
  const hits = BANNED_QUESTION_FIRST_PATTERNS.filter((p) =>
    text.toLowerCase().includes(p.toLowerCase())
  );
  return { ok: hits.length === 0, hits };
}
