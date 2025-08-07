import type { CommitType, Config } from '../types/config.js';
import type { CommitMessage, CommitOptions } from '../types/commit.js';

export type { CommitMessage, CommitOptions };

export class CommitBuilder {
  private config: Config;
  private message: Partial<CommitMessage> = {};

  constructor(config: Config) {
    this.config = config;
  }

  setType(type: string): this {
    this.message.type = type;
    return this;
  }

  setScope(scope: string): this {
    this.message.scope = scope;
    return this;
  }

  setSubject(subject: string): this {
    if (subject.length > this.config.maxSubjectLength) {
      throw new Error(
        `Subject length (${subject.length}) exceeds maximum allowed (${this.config.maxSubjectLength})`
      );
    }
    this.message.subject = subject;
    return this;
  }

  setBody(body: string): this {
    this.message.body = body;
    return this;
  }

  setFooter(footer: string): this {
    this.message.footer = footer;
    return this;
  }

  setBreakingChange(isBreaking: boolean): this {
    this.message.breakingChange = isBreaking;
    return this;
  }

  setEmoji(emoji: string): this {
    this.message.emoji = emoji;
    return this;
  }

  build(): string {
    if (!this.message.type || !this.message.subject) {
      throw new Error('Type and subject are required for commit message');
    }

    const commitType = this.config.commitTypes.find(
      (ct: CommitType) => ct.type === this.message.type
    );
    const emoji = this.config.emojiEnabled && commitType?.emoji ? commitType.emoji + ' ' : '';

    let header = '';

    if (this.config.conventionalCommits) {
      const scope = this.message.scope ? `(${this.message.scope})` : '';
      const breaking = this.message.breakingChange ? '!' : '';
      header = `${this.message.type}${scope}${breaking}: ${emoji}${this.message.subject}`;
    } else {
      header = `${emoji}${this.message.subject}`;
    }

    const parts = [header];

    if (this.message.body) {
      parts.push('', this.message.body);
    }

    if (this.message.footer) {
      parts.push('', this.message.footer);
    }

    return parts.join('\n');
  }

  reset(): this {
    this.message = {};
    return this;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.message.type) {
      errors.push('Commit type is required');
    }

    if (!this.message.subject) {
      errors.push('Commit subject is required');
    }

    if (this.message.subject && this.message.subject.length > this.config.maxSubjectLength) {
      errors.push(`Subject length exceeds maximum (${this.config.maxSubjectLength} characters)`);
    }

    if (
      this.message.type &&
      !this.config.commitTypes.find((ct: CommitType) => ct.type === this.message.type)
    ) {
      errors.push(`Unknown commit type: ${this.message.type}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export function createCommitMessage(
  type: string,
  subject: string,
  options: Partial<CommitOptions & CommitMessage> = {}
): string {
  const builder = new CommitBuilder(
    options.config || {
      commitTypes: [],
      emojiEnabled: true,
      conventionalCommits: true,
      aiSummary: false,
      maxSubjectLength: 50,
      maxBodyLength: 72,
      version: '1.0'
    }
  );

  builder.setType(type).setSubject(subject);

  if (options.scope) builder.setScope(options.scope);
  if (options.body) builder.setBody(options.body);
  if (options.footer) builder.setFooter(options.footer);
  if (options.breakingChange) builder.setBreakingChange(options.breakingChange);
  if (options.emoji) builder.setEmoji(options.emoji);

  return builder.build();
}
