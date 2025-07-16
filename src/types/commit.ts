import type { Config } from './config.js';

export interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
  breakingChange?: boolean;
  emoji?: string;
}

export interface CommitOptions {
  config: Config;
  aiSummary?: boolean;
  dryRun?: boolean;
}