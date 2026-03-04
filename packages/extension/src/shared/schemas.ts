import { z } from "zod";

/**
 * Zod schema for LLM structured output
 */
export const LLMChangeSchema = z.object({
  fieldIndex: z.number().int().nonnegative(),
  action: z.enum(["replace", "append", "clear", "skip"]),
  value: z.string(),
  rationale: z.string().optional(),
});

export const LLMResponseSchema = z.object({
  changes: z.array(LLMChangeSchema),
  globalNotes: z.string().optional(),
});
