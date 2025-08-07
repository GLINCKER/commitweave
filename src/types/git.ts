import type { SimpleGit } from 'simple-git';

export interface GitRepository {
  git: SimpleGit;
  rootDir: string;
}

export interface StagedChanges {
  files: string[];
  summary: string;
  hasChanges: boolean;
}
