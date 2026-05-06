import assert from "node:assert/strict";
import test from "node:test";
import { runPipeline } from "../runPipeline.js";

const evaluatorResult = (overrides = {}) => ({
  key: "keywordMatch",
  label: "Keyword Match",
  score: 80,
  weight: 0.2,
  weightedScore: 16,
  summary: "",
  details: {},
  meta: {},
  ...overrides,
});

test("validates evaluator outputs and aggregates successful results", async () => {
  const calls = [];

  const result = await runPipeline({
    context: {
      resumeText: "JavaScript developer",
    },
    evaluators: [
      {
        key: "keywordMatch",
        evaluate: async (context) => {
          calls.push(`keyword:${context.resumeText}`);
          return evaluatorResult();
        },
      },
      {
        key: "experienceMatch",
        evaluate: async () => {
          calls.push("experience");
          return evaluatorResult({
            key: "experienceMatch",
            label: "Experience Match",
            score: 100,
            weight: 0.2,
            weightedScore: 20,
          });
        },
      },
    ],
  });

  assert.deepEqual(calls, ["keyword:JavaScript developer", "experience"]);
  assert.equal(result.score, 36);
  assert.deepEqual(
    result.evaluators.map((item) => item.key),
    ["keywordMatch", "experienceMatch"],
  );
});

test("throws on malformed evaluator result with evaluator key and invalid fields", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    await assert.rejects(
      runPipeline({
        evaluators: [
          {
            key: "keywordMatch",
            evaluate: async () =>
              evaluatorResult({
                label: "",
                score: 101,
              }),
          },
        ],
      }),
      /Evaluator "keywordMatch" returned invalid output: .*label: .*score:/,
    );
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }
});

test("propagates evaluator exceptions", async () => {
  await assert.rejects(
    runPipeline({
      evaluators: [
        {
          key: "keywordMatch",
          evaluate: async () => {
            throw new Error("keyword evaluator failed");
          },
        },
      ],
    }),
    /keyword evaluator failed/,
  );
});

test("throws when an invalid evaluator registration is supplied", async () => {
  await assert.rejects(
    runPipeline({
      evaluators: [{ key: "keywordMatch" }],
    }),
    /Invalid evaluator supplied to pipeline/,
  );
});

