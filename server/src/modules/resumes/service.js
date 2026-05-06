import Resume from "../../database/models/Resume.js";

/**
 * Upsert a resume for a user.
 * Each user keeps only one stored parsed resume record, 
 * always replacing the previous one with the most recent upload.
 * 
 * @param {string} userId - The ID of the user
 * @param {Object} resumeData - The parsed resume data to save
 * @param {boolean} includeText - Whether to include protected fields in the return (default: false)
 * @returns {Promise<Object>} The saved resume document
 */
export const upsertResume = async (userId, resumeData, includeText = false) => {
  const query = Resume.findOneAndUpdate(
    { user: userId },
    { 
      ...resumeData, 
      user: userId 
    },
    { 
      new: true, 
      upsert: true, 
      runValidators: true 
    }
  );

  if (includeText) {
    query.select("+resumeText");
  }

  return await query;
};

/**
 * Fetch the user's latest (and only) parsed resume record.
 * Enforces ownership by filtering by userId and excludes raw resumeText.
 * 
 * @param {string} userId - The ID of the user
 * @param {boolean} includeText - Whether to include the raw resume text (default: false)
 * @returns {Promise<Object|null>} The resume document or null if not found
 */
export const getLatestResume = async (userId, includeText = false) => {
  const query = Resume.findOne({ user: userId });
  
  if (!includeText) {
    query.select("-resumeText");
  } else {
    query.select("+resumeText"); // Explicitly include if it was marked as select: false
  }

  return await query.lean();
};
