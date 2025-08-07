import { z } from 'zod';
import type { CommitType, Config } from '../types/config.js';

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

export type { CommitType, Config };

export const defaultCommitTypes: CommitType[] = [
  {
    type: 'feat',
    emoji: '✨',
    description: 'A new feature',
    aliases: ['feature', 'new']
  },
  {
    type: 'fix',
    emoji: '🐛',
    description: 'A bug fix',
    aliases: ['bugfix', 'hotfix']
  },
  {
    type: 'docs',
    emoji: '📚',
    description: 'Documentation only changes',
    aliases: ['documentation']
  },
  {
    type: 'style',
    emoji: '💎',
    description: 'Changes that do not affect the meaning of the code',
    aliases: ['formatting']
  },
  {
    type: 'refactor',
    emoji: '📦',
    description: 'A code change that neither fixes a bug nor adds a feature',
    aliases: ['refactoring']
  },
  {
    type: 'perf',
    emoji: '🚀',
    description: 'A code change that improves performance',
    aliases: ['performance', 'optimization']
  },
  {
    type: 'test',
    emoji: '🚨',
    description: 'Adding missing tests or correcting existing tests',
    aliases: ['testing']
  },
  {
    type: 'build',
    emoji: '🛠',
    description: 'Changes that affect the build system or external dependencies',
    aliases: ['ci', 'deps']
  },
  {
    type: 'ci',
    emoji: '⚙️',
    description: 'Changes to our CI configuration files and scripts',
    aliases: ['continuous-integration']
  },
  {
    type: 'chore',
    emoji: '♻️',
    description: 'Other changes that don\'t modify src or test files',
    aliases: ['maintenance']
  },
  {
    type: 'revert',
    emoji: '🗑',
    description: 'Reverts a previous commit',
    aliases: ['rollback']
  }
];

export const defaultConfig: Config = {
  commitTypes: defaultCommitTypes,
  emojiEnabled: true,
  conventionalCommits: true,
  aiSummary: false,
  maxSubjectLength: 50,
  maxBodyLength: 72,
  claude: {
    enabled: false,
    apiKey: "",
    model: "claude-3-haiku-20240307",
    maxTokens: 4000
  },
  ui: {
    fancyUI: true,
    asciiArt: true,
    animations: true,
    colors: true,
    emoji: true
  },
  version: "1.0"
};

export function getCommitTypeByAlias(alias: string): CommitType | undefined {
  return defaultCommitTypes.find(
    type => type.type === alias || type.aliases?.includes(alias)
  );
}