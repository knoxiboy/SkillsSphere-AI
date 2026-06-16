import { z } from 'zod';

export const jobPostingSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().optional(),
    remote: z.boolean().optional(),
  }),
  salary: z.object({
    min: z.number().min(0, 'Minimum salary cannot be negative'),
    max: z.number().min(0, 'Maximum salary cannot be negative'),
    currency: z.string().optional(),
    isNegotiable: z.boolean().optional(),
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experienceRequired: z.number().optional(),
  jobLevel: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(['open', 'closed', 'draft']).optional(),
});

export const updateJobSchema = jobPostingSchema.partial();

export const applyToJobSchema = z.object({
  resumeId: z.string().optional(),
  resumeLink: z.string().url('Invalid URL').optional(),
  coverNote: z.string().optional(),
}).refine(data => data.resumeId || data.resumeLink, {
  message: "Either resumeId or resumeLink must be provided",
  path: ["resumeId"]
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired', 'withdrawn']),
  comment: z.string().optional(),
});

export const updateStudentApplicationStatusSchema = z.object({
  studentStatus: z.enum(['active', 'withdrawn', 'accepted', 'declined']),
});
