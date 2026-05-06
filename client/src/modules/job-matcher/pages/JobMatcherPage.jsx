import { useState } from "react";
import MatcherForm from "../components/MatcherForm";
import MatcherResult from "../components/MatcherResult";
import { getRecommendations, uploadResume } from "../services/matcherService";

export default function JobMatcherPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);

    setTimeout(() => {
      // dummy data
      setData({
        score: 78,
        missingSkills: ["Docker", "System Design"],
        jobs: [
          { title: "Frontend Developer", company: "Google", score: 85 },
          { title: "React Developer", company: "Amazon", score: 80 }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen px-6 py-10">

      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold">
          <span className="text-gradient">Smart Job Matching</span>
        </h1>
        <p className="text-gray-400 mt-3">
          Upload your resume and get AI-powered job recommendations 🚀
        </p>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto mb-8">
        <MatcherForm onSubmit={handleSubmit} />
      </div>

      {/* Results */}
      {loading && (
        <p className="text-center text-gray-300">Loading...</p>
      )}

      {data && <MatcherResult data={data} />}

    </div>
  );
}