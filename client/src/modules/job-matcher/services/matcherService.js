export const getRecommendations = async (resumeId) => {
  // fake API
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        score: 78,
        missingSkills: ["Docker", "System Design"],
        jobs: [
          { title: "Frontend Developer", company: "Google", score: 80 },
          { title: "React Developer", company: "Amazon", score: 75 },
        ],
      });
    }, 1500)
  );
};

export const uploadResume = async (file) => {
  return getRecommendations();
};