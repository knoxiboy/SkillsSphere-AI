import assert from "node:assert/strict";
import test from "node:test";
import { generateComparisonInsights } from "../aiComparison.js";

test("generateComparisonInsights - significant score improvement produces improvement insight", async () => {
  const result = await generateComparisonInsights(
    { score: 60, skills: [], missingSkills: [] },
    { score: 80, skills: [], missingSkills: [] }
  );

  assert.ok(result.includes("improved significantly"), "Should mention significant improvement");
  assert.ok(result.includes("80%") || result.includes("20%"), "Should include score difference");
});

test("generateComparisonInsights - small positive score change produces steady progress insight", async () => {
  const result = await generateComparisonInsights(
    { score: 60, skills: [], missingSkills: [] },
    { score: 65, skills: [], missingSkills: [] }
  );

  assert.ok(result.includes("increased"), "Should mention increase");
  assert.ok(result.includes("5%"), "Should include score difference");
});

test("generateComparisonInsights - negative score change produces decline insight", async () => {
  const result = await generateComparisonInsights(
    { score: 75, skills: [], missingSkills: [] },
    { score: 65, skills: [], missingSkills: [] }
  );

  assert.ok(result.includes("lower"), "Should mention lower score");
  assert.ok(result.includes("-10%"), "Should include negative score difference");
});

test("generateComparisonInsights - three or more added skills produces multi-skill insight", async () => {
  const result = await generateComparisonInsights(
    { score: 60, skills: ["JavaScript"], missingSkills: [] },
    { score: 70, skills: ["JavaScript", "Python", "React", "Node.js"], missingSkills: [] }
  );

  assert.ok(result.includes("integrated"), "Should mention skill integration");
  assert.ok(result.includes("3") || result.includes("4"), "Should mention number of skills");
});

test("generateComparisonInsights - fewer than three added skills produces single-skill insight", async () => {
  const result = await generateComparisonInsights(
    { score: 60, skills: ["JavaScript"], missingSkills: [] },
    { score: 65, skills: ["JavaScript", "TypeScript"], missingSkills: [] }
  );

  assert.ok(result.includes("TypeScript"), "Should mention the added skill");
  assert.ok(result.includes("strengthens"), "Should mention it strengthens foundation");
});

test("generateComparisonInsights - resolved gaps produces congratulatory insight", async () => {
  const result = await generateComparisonInsights(
    { score: 50, skills: [], missingSkills: ["Docker", "Kubernetes"] },
    { score: 60, skills: ["Docker", "Kubernetes"], missingSkills: [] }
  );

  assert.ok(result.includes("resolving"), "Should mention resolving gaps");
  assert.ok(result.includes("2"), "Should mention number of resolved gaps");
});

test("generateComparisonInsights - new gaps produces recommendation insight", async () => {
  const result = await generateComparisonInsights(
    { score: 60, skills: [], missingSkills: [] },
    { score: 65, skills: ["Go"], missingSkills: ["Go"] }
  );

  assert.ok(result.includes("next level"), "Should mention next level");
  assert.ok(result.includes("focus on mastering"), "Should mention focus");
});

test("generateComparisonInsights - no changes returns stable default message", async () => {
  // With identical inputs and no new gaps, the stable message is returned
  const result = await generateComparisonInsights(
    { score: 70, skills: ["Python"], missingSkills: [] },
    { score: 70, skills: ["Python"], missingSkills: [] }
  );

  assert.ok(result.includes("stable") || result.includes("Focus on adding new projects"), "Should return stable message");
});

test("generateComparisonInsights - handles empty skills and missingSkills arrays", async () => {
  const result = await generateComparisonInsights(
    { score: 50, skills: null, missingSkills: null },
    { score: 60, skills: undefined, missingSkills: undefined }
  );

  assert.ok(typeof result === "string", "Should return a string");
  assert.ok(result.length > 0, "Should return a non-empty string");
});
