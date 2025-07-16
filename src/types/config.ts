import { z } from 'zod';

export const CommitTypeSchema = z.object({
  type: z.string(),
  emoji: z.string(),
  description: z.string(),
  aliases: z.array(z.string()).optional()
});

export const ConfigSchema = z.object({
  commitTypes: z.array(CommitTypeSchema),
  emojiEnabled: z.boolean().default(true),
  conventionalCommits: z.boolean().default(true),
  aiSummary: z.boolean().default(false),
  maxSubjectLength: z.number().default(50),
  maxBodyLength: z.number().default(72),
  hooks: z.object({
    preCommit: z.array(z.string()).optional(),
    postCommit: z.array(z.string()).optional()
  }).optional()
});

export type CommitType = z.infer<typeof CommitTypeSchema>;
export type Config = z.infer<typeof ConfigSchema>;