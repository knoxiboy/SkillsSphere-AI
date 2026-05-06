import { experienceEvaluator as runExperienceEvaluator } from "../../../../ai-ml/evaluators/experienceEvaluator.js";
import { keywordEvaluator as runKeywordEvaluator } from "../../../../ai-ml/evaluators/keywordEvaluator.js";
import { skillEvaluator as runSkillEvaluator } from "../../../../ai-ml/evaluators/skillEvaluator.js";

const round = (value) => Math.round(value * 100) / 100;

const summarizeFeedback = (feedback = []) => {
  if (Array.isArray(feedback)) return feedback.join(" ");
  return `${feedback || ""}`;
};

const weightedScore = ({ score = 0, weight = 0 }) => round(score * weight);

const resolveWeight = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return parsed;
};

export const skillMatchEvaluator = {
  key: "skillMatch",
  evaluate: async (context = {}) => {
    const result = runSkillEvaluator({
      resumeSkills: context.resumeSkills || [],
      jobSkills: context.jobSkills || [],
    });

    const weight = resolveWeight(context.skillWeight, result.weight);

    return {
      key: "skillMatch",
      label: "Skill Match",
      score: result.score,
      weight,
      weightedScore: weightedScore({ score: result.score, weight }),
      summary: summarizeFeedback(result.feedback),
      details: {
        feedback: result.feedback || [],
        matchedSkills: result.matchedSkills || [],
        missingSkills: result.missingSkills || [],
        extraSkills: result.extraSkills || [],
      },
      meta: {},
    };
  },
};

export const keywordMatchEvaluator = {
  key: "keywordMatch",
  evaluate: async (context = {}) => {
    const result = runKeywordEvaluator({
      resumeText: context.resumeText || "",
      jobDescription: context.jobDescription || "",
    });

    const weight = resolveWeight(context.keywordWeight, result.weight);

    return {
      key: "keywordMatch",
      label: "Keyword Match",
      score: result.score,
      weight,
      weightedScore: weightedScore({ score: result.score, weight }),
      summary: summarizeFeedback(result.feedback),
      details: {
        feedback: result.feedback || [],
        matchedKeywords: result.matchedKeywords || [],
        missingKeywords: result.missingKeywords || [],
        extraKeywords: result.extraKeywords || [],
      },
      meta: {},
    };
  },
};

export const experienceMatchEvaluator = {
  key: "experienceMatch",
  evaluate: async (context = {}) => {
    const result = runExperienceEvaluator({
      candidateExperienceText: context.candidateExperienceText || "",
      jobDescription: context.jobDescription || "",
      weight: resolveWeight(context.experienceWeight, undefined),
    });

    const weight = resolveWeight(context.experienceWeight, result.weight);

    return {
      key: "experienceMatch",
      label: "Experience Match",
      score: result.score,
      weight,
      weightedScore: weightedScore({ score: result.score, weight }),
      summary: summarizeFeedback(result.feedback),
      details: {
        feedback: result.feedback || [],
        candidateExperience: result.candidateExperience,
        requiredExperience: result.requiredExperience,
        experienceGap: result.experienceGap,
      },
      meta: {},
    };
  },
};

export const resumeEvaluatorAdapters = [
  skillMatchEvaluator,
  keywordMatchEvaluator,
  experienceMatchEvaluator,
];

