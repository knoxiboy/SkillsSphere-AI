import powerVerbs from "../data/powerVerbs.json" with { type: "json" };

export default function readabilityEvaluator({ resumeText = "" }) {

  const PASSIVE_PENALTY = 5;
  const LOW_VERB_PENALTY = 20;
  const WEAK_BULLET_PENALTY = 2;
  const MIN_VERB_DENSITY = 0.5;

  function cleanSentenceStart(sentence) {
    return sentence.replace(/^[\s\u2022\*\u2013\u2014•\-]+/, '').trim();
  }

  function detectDomain(text) {
    if (/react|node|javascript|python|java|aws|sql|docker|kubernetes/gi.test(text)) return "technical";
    if (/managed|led|budget|stakeholder|strategy|p&l|headcount/gi.test(text)) return "management";
    if (/designed|ux|figma|wireframe|prototype|user research/gi.test(text)) return "design";
    return "general";
  }

  function getSentenceCategory(cleanedSentence) {
    const lower = cleanedSentence.toLowerCase();
    if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(lower)) return "date";
    if (lower.split(/\s+/).length < 4) return "short";
    return "bullet";
  }

  const sentences = resumeText
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const allPowerVerbs = Object.values(powerVerbs).flat().map(v => v.toLowerCase());

  const weakBullets = [];
  const passiveVoicePatterns = [
    /\b(?:is|are|was|were|be|been|being)\b\s+\b\w+ed\b/gi,
    /\bresponsible for\b/gi,
    /\bworked on\b/gi,
    /\btasks included\b/gi
  ];

  let powerVerbCount = 0;
  let passiveVoiceCount = 0;

  sentences.forEach(sentence => {
    const cleanedSentence = cleanSentenceStart(sentence);
    const lowerSentence = cleanedSentence.toLowerCase();
    const words = lowerSentence.split(/\s+/);

    const hasPowerVerb = allPowerVerbs.some(verb => words.slice(0, 4).includes(verb));

    if (hasPowerVerb) {
      powerVerbCount++;
    } else {
      const category = getSentenceCategory(cleanedSentence);
      if (category === "bullet") {
        weakBullets.push({
          original: sentence,
          cleaned: cleanedSentence,
          reason: "No action verb in first 4 words",
        });
      }
    }

    // Reset lastIndex for global regex before each test
    passiveVoicePatterns.forEach(p => p.lastIndex = 0);
    if (passiveVoicePatterns.some(pattern => pattern.test(lowerSentence))) {
      passiveVoiceCount++;
    }
  });

  const domain = detectDomain(resumeText);
  const relevantVerbs = powerVerbs[domain] ?? powerVerbs.general ?? [];
  const verbDensity = powerVerbCount / Math.max(1, sentences.length);

  const suggestions = [];

  if (passiveVoiceCount > 2) {
    suggestions.push(
      `${passiveVoiceCount} passive voice instances detected. Rewrite with active verbs (e.g., 'Led', 'Built', 'Drove').`
    );
  }

  if (verbDensity < MIN_VERB_DENSITY) {
    suggestions.push(
      `Verb density is ${Math.round(verbDensity * 100)}% — below 50%. Strengthen bullets using: ${relevantVerbs.slice(0, 3).join(", ")}.`
    );
  }

  if (weakBullets.length > 3) {
    suggestions.push(
      `${weakBullets.length} bullets lack action verbs. Example: "${weakBullets[0]?.cleaned?.slice(0, 40)}..."`
    );
  }

  let score = 100;
  if (sentences.length > 0) {
    score -= passiveVoiceCount * PASSIVE_PENALTY;
    if (verbDensity < 0.4) score -= LOW_VERB_PENALTY;
    else if (verbDensity < MIN_VERB_DENSITY) score -= 10;
    score -= Math.min(weakBullets.length * WEAK_BULLET_PENALTY, 20);
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    key: "readability_match",
    label: "Readability & Impact",
    score: finalScore,
    summary: finalScore > 80
      ? "Strong use of action verbs and active voice."
      : "Some bullets are weak or use passive voice, which reduces the impact of your experience.",
    details: {
      powerVerbCount,
      passiveVoiceCount,
      verbDensity: parseFloat(verbDensity.toFixed(2)),
      weakBullets: weakBullets.slice(0, 5),
      weakBulletCount: weakBullets.length,
      suggestions,
      relevantVerbs,
    },
    meta: {
      sentenceCount: sentences.length,
      isTechnicalDomain: domain === "technical",
      domain,
    }
  };
}