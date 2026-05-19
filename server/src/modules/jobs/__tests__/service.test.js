import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import * as jobService from "../service.js";
import JobPosting from "../../../database/models/JobPosting.js";
import JobApplication from "../../../database/models/JobApplication.js";
import AppError from "../../../utils/AppError.js";

describe("Job Service", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  describe("createJob", () => {
    it("should successfully create a job posting", async () => {
      const mockJobData = { title: "Software Engineer", skills: ["React", "Node"] };
      const mockRecruiterId = "recruiter123";

      const mockCreatedJob = { ...mockJobData, recruiter: mockRecruiterId, _id: "job123" };
      mock.method(JobPosting, "create", () => mockCreatedJob);

      const result = await jobService.createJob(mockJobData, mockRecruiterId);

      assert.equal(JobPosting.create.mock.calls.length, 1);
      assert.deepEqual(JobPosting.create.mock.calls[0].arguments[0], {
        ...mockJobData,
        recruiter: mockRecruiterId,
      });
      assert.deepEqual(result, mockCreatedJob);
    });
  });

  describe("updateJob", () => {
    it("should update a job successfully when user is the owner", async () => {
      const mockJobId = "job123";
      const mockRecruiterId = "recruiter123";
      const mockUpdateData = { title: "Senior Software Engineer" };

      const mockExistingJob = { _id: mockJobId, recruiter: { toString: () => mockRecruiterId } };
      const mockUpdatedJob = { ...mockExistingJob, ...mockUpdateData };

      mock.method(JobPosting, "findById", () => mockExistingJob);
      mock.method(JobPosting, "findByIdAndUpdate", () => mockUpdatedJob);

      const result = await jobService.updateJob(mockJobId, mockUpdateData, mockRecruiterId);

      assert.equal(JobPosting.findById.mock.calls.length, 1);
      assert.equal(JobPosting.findById.mock.calls[0].arguments[0], mockJobId);
      assert.equal(JobPosting.findByIdAndUpdate.mock.calls.length, 1);
      assert.deepEqual(JobPosting.findByIdAndUpdate.mock.calls[0].arguments, [
        mockJobId,
        mockUpdateData,
        { new: true, runValidators: true }
      ]);
      assert.deepEqual(result, mockUpdatedJob);
    });

    it("should throw AppError(404) if job not found", async () => {
      mock.method(JobPosting, "findById", () => null);

      await assert.rejects(
        () => jobService.updateJob("invalidId", {}, "recruiter123"),
        (err) => {
          assert.ok(err instanceof AppError);
          assert.equal(err.statusCode, 404);
          return true;
        }
      );
    });

    it("should throw AppError(403) if recruiter is not the owner", async () => {
      const mockExistingJob = { _id: "job123", recruiter: { toString: () => "differentRecruiter" } };
      mock.method(JobPosting, "findById", () => mockExistingJob);

      await assert.rejects(
        () => jobService.updateJob("job123", {}, "recruiter123"),
        (err) => {
          assert.ok(err instanceof AppError);
          assert.equal(err.statusCode, 403);
          return true;
        }
      );
    });
  });

  describe("deleteJob", () => {
    it("should delete a job and its applications when user is owner", async () => {
      const mockJobId = "job123";
      const mockRecruiterId = "recruiter123";

      const mockExistingJob = { _id: mockJobId, recruiter: { toString: () => mockRecruiterId } };

      mock.method(JobPosting, "findById", () => mockExistingJob);
      mock.method(JobApplication, "deleteMany", () => ({ deletedCount: 5 }));
      mock.method(JobPosting, "findByIdAndDelete", () => mockExistingJob);

      await jobService.deleteJob(mockJobId, mockRecruiterId);

      assert.equal(JobPosting.findById.mock.calls.length, 1);
      assert.equal(JobPosting.findById.mock.calls[0].arguments[0], mockJobId);
      assert.equal(JobApplication.deleteMany.mock.calls.length, 1);
      assert.deepEqual(JobApplication.deleteMany.mock.calls[0].arguments, [{ job: mockJobId }]);
      assert.equal(JobPosting.findByIdAndDelete.mock.calls.length, 1);
      assert.equal(JobPosting.findByIdAndDelete.mock.calls[0].arguments[0], mockJobId);
    });

    it("should throw AppError(404) if job not found for deletion", async () => {
      mock.method(JobPosting, "findById", () => null);

      await assert.rejects(
        () => jobService.deleteJob("invalidId", "recruiter123"),
        (err) => {
          assert.ok(err instanceof AppError);
          assert.equal(err.statusCode, 404);
          return true;
        }
      );
    });

    it("should throw AppError(403) if recruiter does not own the job for deletion", async () => {
      const mockExistingJob = { _id: "job123", recruiter: { toString: () => "differentRecruiter" } };
      mock.method(JobPosting, "findById", () => mockExistingJob);

      await assert.rejects(
        () => jobService.deleteJob("job123", "recruiter123"),
        (err) => {
          assert.ok(err instanceof AppError);
          assert.equal(err.statusCode, 403);
          return true;
        }
      );
    });
  });
});
