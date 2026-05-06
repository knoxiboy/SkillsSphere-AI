import assert from "node:assert/strict";
import test from "node:test";
import { aggregateEvaluatorResults } from "../aggregator.js";

const evaluatorResult = (overrides = {}) => ({
  key: "keywordMatch",
  label: "Keyword Match",
  score: 75,
  weight: 0.2,
  weightedScore: 15,
  summary: "",
  details: {},
  meta: {},
  ...overrides,
});

test("returns correct weighted total rounded to two decimals", () => {
  const result = aggregateEvaluatorResults([
    evaluatorResult({
      key: "skillMatch",
      label: "Skill Match",
      weightedScore: 33.335,
    }),
    evaluatorResult({
      key: "experienceMatch",
      label: "Experience Match",
      weightedScore: 11.111,
    }),
  ]);

  assert.equal(result.score, 44.45);
});

test("clamps the aggregate score to 100", () => {
  const result = aggregateEvaluatorResults([
    evaluatorResult({
      key: "skillMatch",
      label: "Skill Match",
      weightedScore: 80,
    }),
    evaluatorResult({
      key: "experienceMatch",
      label: "Experience Match",
      weightedScore: 40,
    }),
  ]);

  assert.equal(result.score, 100);
});

test("returns stable evaluator breakdown and ordered evaluator list", () => {
  const skill = evaluatorResult({
    key: "skillMatch",
    label: "Skill Match",
    weightedScore: 50,
  });
  const keyword = evaluatorResult({
    key: "keywordMatch",
    label: "Keyword Match",
    weightedScore: 15,
  });

  const result = aggregateEvaluatorResults([skill, keyword]);

  assert.deepEqual(
    result.evaluators.map((item) => item.key),
    ["skillMatch", "keywordMatch"],
  );
  assert.equal(result.breakdown.skillMatch, result.evaluators[0]);
  assert.equal(result.breakdown.keywordMatch, result.evaluators[1]);
});

test("validates evaluator results before aggregation", () => {
  assert.throws(() =>
    aggregateEvaluatorResults([
      evaluatorResult({
        key: "keywordMatch",
        score: 200,
      }),
    ]),
  );
});

