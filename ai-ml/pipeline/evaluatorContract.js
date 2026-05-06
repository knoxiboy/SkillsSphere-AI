import { z } from "zod";

const flexibleRecordSchema = z.record(z.string(), z.unknown()).default({});

export const evaluatorResultSchema = z
  .object({
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    score: z.number().min(0).max(100),
    weight: z.number().min(0).max(1),
    weightedScore: z.number().min(0).max(100),
    summary: z.string().default(""),
    details: flexibleRecordSchema,
    meta: flexibleRecordSchema,
  })
  .strict();

export const validateEvaluatorResult = (result) => evaluatorResultSchema.parse(result);

