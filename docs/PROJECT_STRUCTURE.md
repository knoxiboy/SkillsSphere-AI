# Project Structure

This document reflects the current repository structure and progress implemented so far.

## Top-Level Layout

- `client/`: React frontend application
- `server/`: Node.js + Express backend
- `ai-ml/`: AI and ML evaluators and domain placeholders
- `docs/`: Architecture, API, feature, and quality documents

## Current Implementation Progress

### Frontend (`client`)

Implemented:

- App shell and route configuration in `src/app/App.jsx`
- Landing page module in `src/modules/landing/`
- Auth UI and API integration:
  - `src/modules/auth/Login.jsx`
  - `src/modules/auth/Register.jsx`
  - `src/modules/auth/VerifyEmail.jsx`
  - `src/modules/auth/components/ComponentDemo.jsx`
- Redux auth state in `src/features/auth/authSlice.js`
- API client helpers:
  - `src/services/apiClient.js`
  - `src/services/authService.js`
- Protected dashboard route:
  - `src/modules/dashboard/DashboardPage.jsx`
- Resume Analyzer UI flow:
  - `src/modules/resume-analyzer/components/DragDropUpload.jsx`
  - `src/modules/resume-analyzer/components/AnalysisResult.jsx`
  - `src/modules/resume-analyzer/pages/ResumeAnalyzerPage.jsx` (Updated: integrated Job Description input)
  - `src/modules/resume-analyzer/services/resumeService.js` (Updated: real API integration with JD support)
- User Profile UI:
  - `src/modules/profile/ProfilePage.jsx`
  - `src/modules/profile/components/ProfileField.jsx`
- Recruiter Job Management:
  - `src/modules/recruiter-jobs/pages/RecruiterJobsPage.jsx`
  - `src/modules/recruiter-jobs/pages/CreateJobPostingPage.jsx`
  - `src/modules/recruiter-jobs/components/JobPostingForm.jsx`
  - `src/modules/recruiter-jobs/components/JobPostingCard.jsx`
  - `src/modules/recruiter-jobs/services/jobPostingService.js`
- Shared UI primitives:
  - `src/shared/components/Button.jsx`
  - `src/shared/components/Input.jsx`
  - `src/shared/components/Select.jsx`
  - `src/shared/components/TextArea.jsx` (New: Multi-line text input)
  - `src/shared/components/LoadingState.jsx`
  - `src/shared/components/ErrorState.jsx`
  - `src/shared/components/EmptyState.jsx`
  - `src/shared/components/PageHeader.jsx`

Scaffolded placeholders:

- `classrooms/`
- `job-matcher/`
- `mock-interview/`

### Backend (`server`)

Implemented:

- Express server bootstrap in `server/index.js`
- MongoDB connection setup in `src/database/db.js`
- Database Models:
  - `src/database/models/User.js` — User model for authentication and role management
  - `src/database/models/Resume.js` — Resume model for parsed resume data and skill matching
  - `src/database/models/JobPosting.js` — Mongoose model for recruiter-owned job postings with status, location, skills, and salary constraints
- Auth registration & Login flow:
  - `src/modules/auth/routes.js`
  - `src/modules/auth/controller.js`
  - `src/modules/auth/service.js`
  - `src/validations/authValidation.js`
- Auth & RBAC Middleware:
  - `src/middleware/authMiddleware.js` (JWT & Role verification)
- Resume upload and analysis flow:
  - `src/modules/resumes/routes.js`
  - `src/modules/resumes/controller.js`
  - `src/modules/resumes/service.js` (New: Singleton resume logic and ownership enforcement)
  - `src/middleware/uploadResume.js`

  - `src/utils/parseResume.js`
- Evaluator configuration:
  - `src/config/evaluatorConfig.js`
- Static upload serving via `app.use("/uploads", ...)`
- Recruiter Job Posting system:
  - `src/modules/jobs/routes.js`
  - `src/modules/jobs/controller.js`
  - `src/modules/jobs/service.js`
  - `src/database/models/JobPosting.js`

Scaffolded placeholders:

- `modules/analytics/`
- `modules/classrooms/`
- `modules/interviews/`
- `modules/matching/`
- `modules/users/`

### AI/ML (`ai-ml`)

Implemented:

- Skill evaluator test coverage in `evaluators/__tests__/skillEvaluator.test.js`
- Keyword evaluator test coverage in `evaluators/__tests__/keywordEvaluator.test.js`
- Resume analysis pipeline helpers:
  - `pipeline/evaluatorContract.js`: shared evaluator output schema
  - `pipeline/runPipeline.js`: unified evaluator execution runner
  - `pipeline/aggregator.js`: weighted scoring and breakdown aggregation

Scaffolded placeholders:

- `resume-analysis/`
- `jd-matching/`
- `interview-feedback/`
- `shared/`

## API Surface (Implemented)

- `GET /health`: server health check
- `POST /api/auth/register`: user registration and initial token issuance
- `POST /api/auth/login`: credential verification and JWT issuance
- `POST /api/auth/verify-email`: verify user account via OTP
- `POST /api/auth/resend-otp`: resend email verification OTP
- `POST /api/resume/upload`: upload resume file
- `POST /api/resume/analyze`: parse PDF resume, latest-only upsert flow, optional skill/keyword/experience match
- `GET /api/resume/me/latest`: fetch user's latest parsed resume (no raw resumeText)
- `GET /api/resume/result/:id`: fetch stored resume record by ID

- `GET /uploads/:filename`: static file access for uploaded files
- `POST /api/jobs`: create a new job (Recruiter only)
- `GET /api/jobs`: list all published jobs
- `GET /api/jobs/:id`: get job details
- `PATCH /api/jobs/:id`: update a job (Owner Recruiter only)
- `DELETE /api/jobs/:id`: delete a job (Owner Recruiter only)

## Notes

- Empty folders intentionally contain `.gitkeep` so structure is versioned.
- As implementation begins, add module-level README files where needed.


- `job-matcher/` module now includes the Resume-First Job Recommendation UI with components for resume selection, match score, missing skills, and recommended jobs, following a modular and scalable structure.
