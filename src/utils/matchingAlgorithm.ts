// Weighted personality-based compatibility scoring

interface PersonalityAnswers {
  relationship_goal?: string;
  love_language?: string[];
  social_battery?: string;
  life_goals?: string;
  conflict_style?: string;
  humor_type?: string;
  empathy_score?: number;
  self_awareness?: number;
  emotional_openness?: number;
  relationship_pace?: string;
  ideal_weekend?: string;
  work_ethic?: string;
  ambition_level?: number;
  dealbreakers?: string[];
  fun_activity?: string[];
}

interface UserProfile {
  personality?: PersonalityAnswers;
  interests?: string[];
}

// Jaccard similarity for arrays
function jaccardSimilarity(a: string[], b: string[]): number {
  if (!a?.length || !b?.length) return 0.5; // neutral if missing
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

// Scale similarity: distance on a numeric scale (1-10)
function scaleSimilarity(a?: number, b?: number, max = 10): number {
  if (a == null || b == null) return 0.5;
  return 1 - Math.abs(a - b) / max;
}

// Exact match
function exactMatch(a?: string, b?: string): number {
  if (!a || !b) return 0.5;
  return a === b ? 1 : 0;
}

// Social battery similarity (introvert=1, ambivert=2, extrovert=3)
function socialBatterySimilarity(a?: string, b?: string): number {
  const scale: Record<string, number> = { introvert: 1, ambivert: 2, extrovert: 3 };
  const va = scale[a || ""] ?? 2;
  const vb = scale[b || ""] ?? 2;
  return 1 - Math.abs(va - vb) / 2;
}

// Compatible conflict styles
const conflictCompatibility: Record<string, Record<string, number>> = {
  direct: { direct: 0.7, compromise: 1.0, avoid: 0.3 },
  compromise: { direct: 1.0, compromise: 1.0, avoid: 0.7 },
  avoid: { direct: 0.3, compromise: 0.7, avoid: 0.5 },
};

function conflictStyleScore(a?: string, b?: string): number {
  if (!a || !b) return 0.5;
  return conflictCompatibility[a]?.[b] ?? 0.5;
}

// Compatible humor types
const humorCompatibility: Record<string, Record<string, number>> = {
  dry: { dry: 1.0, sarcastic: 0.8, wholesome: 0.5, dark: 0.6 },
  sarcastic: { dry: 0.8, sarcastic: 1.0, wholesome: 0.3, dark: 0.8 },
  wholesome: { dry: 0.5, sarcastic: 0.3, wholesome: 1.0, dark: 0.2 },
  dark: { dry: 0.6, sarcastic: 0.8, wholesome: 0.2, dark: 1.0 },
};

function humorScore(a?: string, b?: string): number {
  if (!a || !b) return 0.5;
  return humorCompatibility[a]?.[b] ?? 0.5;
}

/**
 * Calculate weighted compatibility score between two users.
 * Returns a score from 0-100.
 */
export function calculatePersonalityCompatibility(
  userA: UserProfile,
  userB: UserProfile
): number {
  const pA = userA.personality || {};
  const pB = userB.personality || {};

  const weights = [
    { weight: 25, score: exactMatch(pA.relationship_goal, pB.relationship_goal) },
    { weight: 20, score: jaccardSimilarity(pA.love_language || [], pB.love_language || []) },
    { weight: 15, score: socialBatterySimilarity(pA.social_battery, pB.social_battery) },
    { weight: 15, score: exactMatch(pA.life_goals, pB.life_goals) },
    { weight: 10, score: conflictStyleScore(pA.conflict_style, pB.conflict_style) },
    {
      weight: 10,
      score: jaccardSimilarity(userA.interests || [], userB.interests || []),
    },
    { weight: 5, score: humorScore(pA.humor_type, pB.humor_type) },
  ];

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const weightedScore = weights.reduce((sum, w) => sum + w.weight * w.score, 0);

  return Math.round((weightedScore / totalWeight) * 100);
}

/**
 * Generate personality trait chips from answers.
 */
export function getPersonalityTraits(answers?: PersonalityAnswers): string[] {
  if (!answers) return [];
  const traits: string[] = [];

  if (answers.social_battery === "introvert") traits.push("Introvert");
  if (answers.social_battery === "ambivert") traits.push("Ambivert");
  if (answers.social_battery === "extrovert") traits.push("Extrovert");

  if (answers.empathy_score && answers.empathy_score >= 8) traits.push("Empathetic");
  if (answers.self_awareness && answers.self_awareness >= 8) traits.push("Self-aware");
  if (answers.emotional_openness && answers.emotional_openness >= 8) traits.push("Open");

  if (answers.life_goals === "adventure") traits.push("Adventurous");
  if (answers.life_goals === "career") traits.push("Career-focused");
  if (answers.life_goals === "family") traits.push("Family-oriented");
  if (answers.life_goals === "balance") traits.push("Balanced");

  if (answers.humor_type) {
    const humorLabel: Record<string, string> = {
      dry: "Dry Humor",
      sarcastic: "Sarcastic",
      wholesome: "Wholesome",
      dark: "Dark Humor",
    };
    if (humorLabel[answers.humor_type]) traits.push(humorLabel[answers.humor_type]);
  }

  if (answers.relationship_goal === "serious") traits.push("Serious dater");
  if (answers.relationship_goal === "marriage") traits.push("Marriage-minded");

  return traits.slice(0, 4);
}
