/**
 * Speech Recognition transcript deduplication and intelligent merging utility.
 * Solves the Web Speech API issue where mobile/desktop browsers re-emit overlapping
 * speech chunks or repeat words/phrases across pauses and session restarts.
 */

// Common Hindi words that should NEVER be repeated consecutively in spoken Hindi
const NON_REDUPLICATING_HINDI_WORDS = new Set([
  'मुझे', 'मुझको', 'मेरा', 'मेरी', 'मेरे', 'मैं', 'हम', 'हमें', 'हमारा',
  'तुम', 'तुमसे', 'तुम्हें', 'तुम्हारा', 'तुम्हारी', 'आपके', 'आपको', 'आपका', 'आपकी', 'आप',
  'यह', 'वह', 'ये', 'वे', 'इसे', 'उसे', 'इन्हें', 'उन्हें', 'इस', 'उस',
  'का', 'के', 'की', 'को', 'से', 'में', 'पर', 'ने', 'तक',
  'है', 'हैं', 'था', 'थी', 'थे', 'थीं', 'होगी', 'होगा', 'होंगे',
  'अगर', 'यदि', 'तो', 'कि', 'क्योंकि', 'लेकिन', 'मगर', 'परंतु', 'और', 'या', 'अथवा',
  'नहीं', 'मत', 'ना',
  'क्या', 'क्यों', 'कब', 'कहाँ', 'कैसे', 'किस', 'किसने', 'किसको', 'किसका',
  'जो', 'जिस', 'जिसने', 'जिसका', 'जिसके', 'जिसकी',
  'गया', 'गई', 'गए', 'रहा', 'रही', 'रहे', 'कर', 'किया', 'दिया', 'लिया'
]);

/**
 * Clean up unnatural consecutive repetitions of words and multi-word phrases.
 * Handles:
 * 1. Multi-word phrase repeats: e.g. "मुझे तुमसे मुझे तुमसे" -> "मुझे तुमसे"
 * 2. Tripled/quadrupled word repeats: e.g. "अगर अगर अगर" -> "अगर"
 * 3. Prohibited non-reduplicating word repeats: e.g. "मुझे मुझे" -> "मुझे"
 */
export function cleanRepetitiveSpeech(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  let words = rawText.trim().split(/\s+/);
  if (words.length <= 1) return rawText.trim();

  // Step 1: Remove consecutive identical single words
  const step1: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const prev = step1.length > 0 ? step1[step1.length - 1] : null;
    const prev2 = step1.length > 1 ? step1[step1.length - 2] : null;

    if (prev && prev.toLowerCase() === current.toLowerCase()) {
      // If repeated 3 times (e.g. "अगर अगर अगर"), definitely drop
      if (prev2 && prev2.toLowerCase() === current.toLowerCase()) {
        continue;
      }
      // If it's a word that cannot legitimately repeat in Hindi (e.g. "मुझे मुझे", "का का", "नहीं नहीं")
      if (NON_REDUPLICATING_HINDI_WORDS.has(current.toLowerCase())) {
        continue;
      }
    }
    step1.push(current);
  }

  // Step 2: Remove consecutive multi-word repeated phrases (length 2 to 6 words)
  let i = 0;
  const step2: string[] = [];
  while (i < step1.length) {
    let repeatFound = false;

    // Check longer phrase repeats first (6 down to 2 words)
    for (let len = Math.min(6, Math.floor((step1.length - i) / 2)); len >= 2; len--) {
      const phrase1 = step1.slice(i, i + len).join(' ').toLowerCase();
      const phrase2 = step1.slice(i + len, i + 2 * len).join(' ').toLowerCase();

      if (phrase1 === phrase2) {
        // Repeated phrase detected! Keep phrase1 once and skip phrase2
        for (let k = 0; k < len; k++) {
          step2.push(step1[i + k]);
        }
        i += 2 * len;
        repeatFound = true;
        break;
      }
    }

    if (!repeatFound) {
      step2.push(step1[i]);
      i++;
    }
  }

  return step2.join(' ');
}

/**
 * Intelligently merge existing accumulated speech transcript with incoming transcript chunk.
 * Detects prefix/suffix overlap so when speech recognizer restarts or sends overlapping words,
 * they are merged seamlessly without repeating any words.
 */
export function mergeTranscripts(existingText: string, incomingChunk: string): string {
  const t1 = (existingText || '').trim();
  const t2 = (incomingChunk || '').trim();

  if (!t1) return t2;
  if (!t2) return t1;

  // Exact duplicate
  if (t1.toLowerCase() === t2.toLowerCase()) return t1;

  // If t1 already ends with t2, or t1 completely contains t2 at the end
  if (t1.toLowerCase().endsWith(t2.toLowerCase())) return t1;

  // If t2 starts with t1, t2 is an in-place expansion of t1
  if (t2.toLowerCase().startsWith(t1.toLowerCase())) return t2;

  // If one completely contains the other
  if (t1.toLowerCase().includes(t2.toLowerCase())) return t1;
  if (t2.toLowerCase().includes(t1.toLowerCase())) return t2;

  const words1 = t1.split(/\s+/);
  const words2 = t2.split(/\s+/);

  // Check word-by-word suffix of words1 matching prefix of words2
  const maxOverlap = Math.min(words1.length, words2.length);
  for (let k = maxOverlap; k >= 1; k--) {
    const suffix1 = words1.slice(words1.length - k).join(' ').toLowerCase();
    const prefix2 = words2.slice(0, k).join(' ').toLowerCase();

    if (suffix1 === prefix2) {
      // Overlap of k words found! Merge without repeating
      const merged = [...words1, ...words2.slice(k)].join(' ');
      return cleanRepetitiveSpeech(merged);
    }
  }

  // Check if any trailing window of words1 (up to 5 words) matches somewhere in the first half of words2
  const windowSize = Math.min(5, words1.length);
  for (let w = windowSize; w >= 2; w--) {
    const endChunk = words1.slice(words1.length - w).join(' ').toLowerCase();
    const idx = t2.toLowerCase().indexOf(endChunk);
    if (idx !== -1) {
      const remainder = t2.slice(idx + endChunk.length).trim();
      const merged = remainder ? `${t1} ${remainder}` : t1;
      return cleanRepetitiveSpeech(merged);
    }
  }

  // No overlap detected; join with space
  const merged = `${t1} ${t2}`;
  return cleanRepetitiveSpeech(merged);
}
