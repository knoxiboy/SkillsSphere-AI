import mongoose from "mongoose";

const matchResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    recommendations: [
      {
        job: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "JobPosting",
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        breakdown: {
          type: Object,
        },
        skillMatch: {
          type: Object,
        },
        keywordMatch: {
          type: Object,
        },
        experienceMatch: {
          type: Object,
        },
      },
    ],
  },
  { timestamps: true }
);

const MatchResult = mongoose.model("MatchResult", matchResultSchema);
export default MatchResult;
