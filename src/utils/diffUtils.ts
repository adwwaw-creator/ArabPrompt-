/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
  unchanged?: boolean;
}

export interface PromptMetrics {
  wordsCount: number;
  charsCount: number;
  tokensEstimate: number;
  uniqueWordsCount: number;
  sentenceCount: number;
  avgWordLength: number;
}

/**
 * Tokenize string into words and whitespace/punctuation preserving separators
 */
function tokenizeWords(text: string): string[] {
  if (!text) return [];
  // Match words or spaces or punctuation
  const tokens = text.match(/\S+|\s+/g);
  return tokens || [text];
}

/**
 * Compute word-level diff using Longest Common Subsequence (LCS)
 */
export function computeWordDiff(textA: string, textB: string): {
  partsA: DiffPart[];
  partsB: DiffPart[];
  unified: DiffPart[];
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
} {
  const wordsA = tokenizeWords(textA || '');
  const wordsB = tokenizeWords(textB || '');

  const m = wordsA.length;
  const n = wordsB.length;

  // Build DP table for LCS
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (wordsA[i].trim() === wordsB[j].trim() && wordsA[i].trim() !== '') {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to assemble diffs
  let i = m;
  let j = n;

  const stackA: DiffPart[] = [];
  const stackB: DiffPart[] = [];
  const stackUnified: DiffPart[] = [];

  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1].trim() === wordsB[j - 1].trim() && wordsA[i - 1].trim() !== '') {
      const val = wordsB[j - 1];
      stackA.unshift({ value: wordsA[i - 1], unchanged: true });
      stackB.unshift({ value: val, unchanged: true });
      stackUnified.unshift({ value: val, unchanged: true });
      unchangedCount++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Added in B
      const val = wordsB[j - 1];
      stackB.unshift({ value: val, added: true });
      stackUnified.unshift({ value: val, added: true });
      if (val.trim() !== '') addedCount++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      // Removed from A
      const val = wordsA[i - 1];
      stackA.unshift({ value: val, removed: true });
      stackUnified.unshift({ value: val, removed: true });
      if (val.trim() !== '') removedCount++;
      i--;
    } else {
      break;
    }
  }

  return {
    partsA: stackA,
    partsB: stackB,
    unified: stackUnified,
    addedCount,
    removedCount,
    unchangedCount
  };
}

/**
 * Calculate linguistic and prompt metrics
 */
export function calculatePromptMetrics(text: string): PromptMetrics {
  if (!text || !text.trim()) {
    return {
      wordsCount: 0,
      charsCount: 0,
      tokensEstimate: 0,
      uniqueWordsCount: 0,
      sentenceCount: 0,
      avgWordLength: 0
    };
  }

  const clean = text.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordsCount = words.length;
  const charsCount = clean.length;
  
  // Rule of thumb for Arabic & English tokens in LLMs
  const tokensEstimate = Math.ceil(wordsCount * 1.35 + (charsCount * 0.15));

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const uniqueWordsCount = uniqueWords.size;

  const sentences = clean.split(/[.!?؟]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  const totalWordChars = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLength = wordsCount > 0 ? Number((totalWordChars / wordsCount).toFixed(1)) : 0;

  return {
    wordsCount,
    charsCount,
    tokensEstimate,
    uniqueWordsCount,
    sentenceCount,
    avgWordLength
  };
}
