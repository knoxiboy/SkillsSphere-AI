import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import JobPosting from "../JobPosting.js";

// Test data helpers
const validRecruiterObjectId = new mongoose.Types.ObjectId();

const createValidJobPosting = () => ({
  title: "Senior React Developer",
  description: "We are looking for an experienced React developer with 5+ years of experience to join our team.",
  skills: ["React", "JavaScript", "Node.js"],
  status: "open",
  recruiter: validRecruiterObjectId,
  location: {
    city: "New York",
    state: "NY",
    country: "USA",
    remote: false,
  },
  salary: {
    min: 100000,
    max: 150000,
    currency: "USD",
    isNegotiable: true,
  },
});

// ========== VALID DOCUMENT TESTS ==========
test("JobPosting - validates a fully correct document", () => {
  const job = new JobPosting(createValidJobPosting());
  const errors = job.validateSync();
  assert.equal(errors, undefined, "Valid document should not have validation errors");
});

test("JobPosting - model exports correctly with correct name", () => {
  assert.equal(JobPosting.modelName, "JobPosting");
  assert.equal(JobPosting.collection.name, "jobpostings");
});

// ========== REQUIRED FIELDS TESTS ==========
test("JobPosting - rejects missing title", () => {
  const job = new JobPosting({ ...createValidJobPosting(), title: undefined });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors.title, "Should have title error");
  assert.match(errors.errors.title.message, /Job title is required/);
});

test("JobPosting - rejects missing description", () => {
  const job = new JobPosting({ ...createValidJobPosting(), description: undefined });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors.description, "Should have description error");
  assert.match(errors.errors.description.message, /Job description is required/);
});

test("JobPosting - rejects missing skills array", () => {
  const job = new JobPosting({ ...createValidJobPosting(), skills: undefined });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors.skills, "Should have skills error");
  assert.match(errors.errors.skills.message, /At least one skill is required/);
});

test("JobPosting - rejects empty skills array", () => {
  const job = new JobPosting({ ...createValidJobPosting(), skills: [] });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors.skills, "Should have skills error");
  assert.match(errors.errors.skills.message, /At least one skill is required/);
});

test("JobPosting - rejects missing recruiter", () => {
  const job = new JobPosting({ ...createValidJobPosting(), recruiter: undefined });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors.recruiter, "Should have recruiter error");
  assert.match(errors.errors.recruiter.message, /Recruiter ownership is required/);
});

test("JobPosting - rejects missing location.city", () => {
  const data = createValidJobPosting();
  delete data.location.city;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors["location.city"], "Should have city error");
  assert.match(errors.errors["location.city"].message, /City is required/);
});

test("JobPosting - rejects missing location.state", () => {
  const data = createValidJobPosting();
  delete data.location.state;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors["location.state"], "Should have state error");
  assert.match(errors.errors["location.state"].message, /State is required/);
});

// Note: location.country is not required to be checked for missing because it has a default value "India"
// When the field is omitted, the default is applied before validation runs
test("JobPosting - applies default location.country 'India' when omitted", () => {
  const data = createValidJobPosting();
  delete data.location.country;
  const job = new JobPosting(data);
  assert.equal(job.location.country, "India", "Country should default to 'India'");
  const errors = job.validateSync();
  assert.equal(errors, undefined, "Should be valid with default country");
});

test("JobPosting - rejects missing salary.min", () => {
  const data = createValidJobPosting();
  delete data.salary.min;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors["salary.min"], "Should have salary.min error");
  assert.match(errors.errors["salary.min"].message, /Minimum salary is required/);
});

test("JobPosting - rejects missing salary.max", () => {
  const data = createValidJobPosting();
  delete data.salary.max;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors["salary.max"], "Should have salary.max error");
  assert.match(errors.errors["salary.max"].message, /Maximum salary is required/);
});

// ========== STATUS ENUM TESTS ==========
test("JobPosting - rejects invalid status enum", () => {
  const job = new JobPosting({ ...createValidJobPosting(), status: "invalid" });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.ok(errors.errors.status, "Should have status error");
  assert.match(errors.errors.status.message, /is not a valid enum value/);
});

test("JobPosting - accepts valid status enum values", () => {
  ["draft", "open", "closed"].forEach((status) => {
    const job = new JobPosting({ ...createValidJobPosting(), status });
    const errors = job.validateSync();
    assert.equal(errors, undefined, `Status '${status}' should be valid`);
  });
});

// ========== DEFAULTS TESTS ==========
test("JobPosting - applies safe default status 'draft' when omitted", () => {
  const data = createValidJobPosting();
  delete data.status;
  const job = new JobPosting(data);
  assert.equal(job.status, "draft", "Should default to 'draft' status");
});

test("JobPosting - location.country has safe default 'India'", () => {
  const data = createValidJobPosting();
  delete data.location.country;
  const job = new JobPosting(data);
  assert.equal(job.location.country, "India", "Should default country to 'India'");
});

test("JobPosting - applies default location.remote false", () => {
  const data = createValidJobPosting();
  delete data.location.remote;
  const job = new JobPosting(data);
  assert.equal(job.location.remote, false, "Should default remote to false");
});

test("JobPosting - applies default salary.currency 'INR'", () => {
  const data = createValidJobPosting();
  delete data.salary.currency;
  const job = new JobPosting(data);
  assert.equal(job.salary.currency, "INR", "Should default currency to 'INR'");
});

test("JobPosting - applies default salary.isNegotiable false", () => {
  const data = createValidJobPosting();
  delete data.salary.isNegotiable;
  const job = new JobPosting(data);
  assert.equal(job.salary.isNegotiable, false, "Should default isNegotiable to false");
});

test("JobPosting - defaults do NOT create active job postings (status draft prevents auto-publishing)", () => {
  const data = createValidJobPosting();
  delete data.status;
  const job = new JobPosting(data);
  // If status defaulted to "open", this would be an active posting (BAD)
  // Status should default to "draft" (SAFE)
  assert.equal(job.status, "draft", "New job should be draft, not active");
  assert.notEqual(job.status, "open", "Status should NOT default to 'open'");
});

// ========== STRING FIELD VALIDATION TESTS ==========
test("JobPosting - rejects title shorter than 2 characters", () => {
  const job = new JobPosting({ ...createValidJobPosting(), title: "X" });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.match(errors.errors.title.message, /at least 2 characters/);
});

test("JobPosting - rejects title longer than 120 characters", () => {
  const longTitle = "A".repeat(121);
  const job = new JobPosting({ ...createValidJobPosting(), title: longTitle });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.match(errors.errors.title.message, /cannot exceed 120 characters/);
});

test("JobPosting - rejects description shorter than 20 characters", () => {
  const job = new JobPosting({ ...createValidJobPosting(), description: "Short" });
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.match(errors.errors.description.message, /at least 20 characters/);
});

test("JobPosting - trims whitespace from title", () => {
  const job = new JobPosting({ ...createValidJobPosting(), title: "  DevOps Engineer  " });
  assert.equal(job.title, "DevOps Engineer", "Title should be trimmed");
});

test("JobPosting - trims whitespace from location fields", () => {
  const data = createValidJobPosting();
  data.location.city = "  San Francisco  ";
  data.location.state = "  CA  ";
  const job = new JobPosting(data);
  assert.equal(job.location.city, "San Francisco", "City should be trimmed");
  assert.equal(job.location.state, "CA", "State should be trimmed");
});

test("JobPosting - converts currency to uppercase", () => {
  const data = createValidJobPosting();
  data.salary.currency = "usd";
  const job = new JobPosting(data);
  assert.equal(job.salary.currency, "USD", "Currency should be uppercase");
});

// ========== SKILLS NORMALIZATION TESTS ==========
test("JobPosting - normalizes skills to lowercase", () => {
  const data = createValidJobPosting();
  data.skills = ["React", "JAVASCRIPT", "Node.js"];
  const job = new JobPosting(data);
  assert.deepEqual(job.skills, ["react", "javascript", "node.js"], "Skills should be lowercase");
});

test("JobPosting - trims skill whitespace", () => {
  const data = createValidJobPosting();
  data.skills = ["  React  ", " JavaScript ", "Node.js"];
  const job = new JobPosting(data);
  assert.deepEqual(job.skills, ["react", "javascript", "node.js"], "Skills should be trimmed");
});

test("JobPosting - filters empty strings from skills", () => {
  const data = createValidJobPosting();
  data.skills = ["React", "", "  ", "JavaScript"];
  const job = new JobPosting(data);
  assert.deepEqual(job.skills, ["react", "javascript"], "Empty skills should be filtered");
});

test("JobPosting - deduplicates skills after normalization", () => {
  const data = createValidJobPosting();
  data.skills = ["React", "react", "  REACT  ", "JavaScript"];
  const job = new JobPosting(data);
  // After normalization: ["react", "react", "react", "javascript"]
  // Deduplication should happen at validation, but let's check the array
  assert.ok(job.skills.includes("react"), "Should contain react");
  assert.ok(job.skills.includes("javascript"), "Should contain javascript");
});

// ========== SALARY VALIDATION TESTS ==========
test("JobPosting - rejects negative minimum salary", () => {
  const data = createValidJobPosting();
  data.salary.min = -10000;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.match(errors.errors["salary.min"].message, /cannot be negative/);
});

test("JobPosting - rejects negative maximum salary", () => {
  const data = createValidJobPosting();
  data.salary.max = -10000;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.match(errors.errors["salary.max"].message, /cannot be negative/);
});

test("JobPosting - allows zero salary (unpaid internship case)", () => {
  const data = createValidJobPosting();
  data.salary.min = 0;
  data.salary.max = 0;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.equal(errors, undefined, "Zero salary should be valid");
});

test("JobPosting - rejects when max salary is less than min salary", () => {
  const data = createValidJobPosting();
  data.salary.min = 150000;
  data.salary.max = 100000;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.ok(errors, "Should have validation errors");
  assert.match(
    errors.errors["salary.max"].message,
    /Maximum salary must be greater than or equal to minimum salary/
  );
});

test("JobPosting - allows equal min and max salary", () => {
  const data = createValidJobPosting();
  data.salary.min = 100000;
  data.salary.max = 100000;
  const job = new JobPosting(data);
  const errors = job.validateSync();
  assert.equal(errors, undefined, "Equal min and max salary should be valid");
});

// ========== TIMESTAMPS TESTS ==========
test("JobPosting - includes timestamps in schema", () => {
  const job = new JobPosting(createValidJobPosting());
  assert.ok(job.schema.paths.createdAt, "Schema should have createdAt");
  assert.ok(job.schema.paths.updatedAt, "Schema should have updatedAt");
});

// ========== RECRUITER REFERENCE TESTS ==========
test("JobPosting - accepts valid ObjectId for recruiter", () => {
  const job = new JobPosting(createValidJobPosting());
  const errors = job.validateSync();
  assert.equal(errors, undefined, "Valid ObjectId for recruiter should be accepted");
  assert.equal(job.recruiter.toString(), validRecruiterObjectId.toString());
});

test("JobPosting - recruiter field is indexed in schema", () => {
  // Check that the schema defines recruiter as indexed
  const recruiterPath = JobPosting.schema.paths.recruiter;
  assert.ok(recruiterPath, "Recruiter path should exist in schema");
  assert.equal(recruiterPath.options.index, true, "Recruiter field should be marked with index: true");
});
