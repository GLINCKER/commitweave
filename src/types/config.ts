import { z } from 'zod';

export const CommitTypeSchema = z.object({
  type: z.string(),
  emoji: z.string(),
  description: z.string(),
  aliases: z.array(z.string()).optional()
});

export const AIConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'mock']).default('mock'),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(150)
});

export const ConfigSchema = z.object({
  commitTypes: z.array(CommitTypeSchema),
  emojiEnabled: z.boolean().default(true),
  conventionalCommits: z.boolean().default(true),
  aiSummary: z.boolean().default(false),
  ai: AIConfigSchema.optional(),
  maxSubjectLength: z.number().default(50),
  maxBodyLength: z.number().default(72),
  hooks: z.object({
    preCommit: z.array(z.string()).optional(),
    postCommit: z.array(z.string()).optional()
  }).optional()
});

export type CommitType = z.infer<typeof CommitTypeSchema>;
export type AIConfig = z.infer<typeof AIConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;