import type { SimpleGit, StatusResult } from 'simple-git';
import type { GitRepository, StagedChanges } from '../types/git.js';
import { lazy } from './lazyImport.js';

export type { GitRepository, StagedChanges };

export class GitUtils {
  private git: SimpleGit | null = null;
  private rootDir: string;

  constructor(workingDir?: string) {
    this.rootDir = workingDir || globalThis.process?.cwd?.() || '.';
  }

  public async getGit(): Promise<SimpleGit> {
    if (!this.git) {
      const { default: simpleGit } = await lazy(() => import('simple-git'));
      this.git = simpleGit(this.rootDir);
    }
    return this.git;
  }

  async isGitRepository(): Promise<boolean> {
    try {
      const git = await this.getGit();
      await git.status();
      return true;
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<StatusResult> {
    const git = await this.getGit();
    return await git.status();
  }

  async getStagedChanges(): Promise<StagedChanges> {
    const status = await this.getStatus();
    const stagedFiles = [...status.staged, ...status.renamed.map((r: { to: string }) => r.to)];

    return {
      files: stagedFiles,
      summary: this.formatChangesSummary(status),
      hasChanges: stagedFiles.length > 0
    };
  }

  async getDiff(staged = true): Promise<string> {
    try {
      const git = await this.getGit();
      if (staged) {
        return await git.diff(['--cached']);
      } else {
        return await git.diff();
      }
    } catch (error) {
      console.warn('Failed to get git diff:', error);
      return '';
    }
  }

  async stageAll(): Promise<void> {
    const git = await this.getGit();
    await git.add('.');
  }

  async stageFiles(files: string[]): Promise<void> {
    const git = await this.getGit();
    await git.add(files);
  }

  async commit(message: string, options: { dryRun?: boolean } = {}): Promise<string> {
    if (options.dryRun) {
      return `[DRY RUN] Would commit with message: ${message}`;
    }

    try {
      const git = await this.getGit();
      const result = await git.commit(message);
      return `Committed: ${result.commit} - ${result.summary?.changes} changes`;
    } catch (error) {
      throw new Error(`Failed to commit: ${error}`);
    }
  }

  async stageAllAndCommit(message: string, options: { dryRun?: boolean } = {}): Promise<string> {
    try {
      if (!(await this.isGitRepository())) {
        throw new Error('Not a git repository. Please run "git init" to initialize a repository.');
      }

      if (options.dryRun) {
        const status = await this.getStatus();
        const unstagedFiles = [...status.modified, ...status.not_added, ...status.deleted];

        if (unstagedFiles.length === 0) {
          return '[DRY RUN] No files to stage and commit';
        }

        return `[DRY RUN] Would stage ${unstagedFiles.length} file(s) and commit with message: "${message}"`;
      }

      await this.stageAll();

      const status = await this.getStatus();
      if (status.staged.length === 0) {
        throw new Error('No staged changes to commit. Make sure you have changes to commit.');
      }

      const git = await this.getGit();
      const result = await git.commit(message);
      return `Successfully committed: ${result.commit} (${status.staged.length} file(s) staged)`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Git operation failed: ${error.message}`);
      }
      throw new Error(`Git operation failed: ${String(error)}`);
    }
  }

  async getCurrentBranch(): Promise<string> {
    const git = await this.getGit();
    const branchSummary = await git.branch();
    return branchSummary.current;
  }

  async getLastCommitMessage(): Promise<string> {
    try {
      const git = await this.getGit();
      const log = await git.log({ maxCount: 1 });
      return log.latest?.message || '';
    } catch {
      return '';
    }
  }

  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.getStatus();
    return status.files.length > 0;
  }

  private formatChangesSummary(status: StatusResult): string {
    const changes: string[] = [];

    if (status.created.length > 0) {
      changes.push(`${status.created.length} created`);
    }
    if (status.modified.length > 0) {
      changes.push(`${status.modified.length} modified`);
    }
    if (status.deleted.length > 0) {
      changes.push(`${status.deleted.length} deleted`);
    }
    if (status.renamed.length > 0) {
      changes.push(`${status.renamed.length} renamed`);
    }

    return changes.length > 0 ? changes.join(', ') : 'No changes';
  }
}

export async function createGitRepository(workingDir?: string): Promise<GitRepository> {
  const gitUtils = new GitUtils(workingDir);

  if (!(await gitUtils.isGitRepository())) {
    throw new Error('Not a git repository');
  }

  return {
    git: await gitUtils.getGit(),
    rootDir: gitUtils['rootDir']
  };
}

export async function stageAllAndCommit(
  message: string,
  options: { dryRun?: boolean; workingDir?: string } = {}
): Promise<string> {
  const gitUtils = new GitUtils(options.workingDir);
  const commitOptions = options.dryRun !== undefined ? { dryRun: options.dryRun } : {};
  return await gitUtils.stageAllAndCommit(message, commitOptions);
}

export function formatFilePath(filePath: string, maxLength = 50): string {
  if (filePath.length <= maxLength) {
    return filePath;
  }

  const parts = filePath.split('/');
  if (parts.length <= 2) {
    return filePath;
  }

  const fileName = parts[parts.length - 1];
  const dirName = parts[parts.length - 2];

  return `.../${dirName}/${fileName}`;
}
