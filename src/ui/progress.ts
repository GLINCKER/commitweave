/**
 * Progress indicators and loading animations for CommitWeave
 */

export class ProgressIndicator {
  private interval: NodeJS.Timeout | undefined;
  private message: string;
  private frames: string[];
  private currentFrame: number = 0;

  constructor(
    message: string,
    frames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  ) {
    this.message = message;
    this.frames = frames;
  }

  start(): void {
    // Hide cursor
    process.stdout.write('\x1B[?25l');

    this.interval = setInterval(() => {
      const frame = this.frames[this.currentFrame];
      process.stdout.write(`\r${frame} ${this.message}`);
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 100);
  }

  update(message: string): void {
    this.message = message;
  }

  succeed(message?: string): void {
    this.stop();
    const finalMessage = message || this.message;
    process.stdout.write(`\r✅ ${finalMessage}\n`);
    // Show cursor
    process.stdout.write('\x1B[?25h');
  }

  fail(message?: string): void {
    this.stop();
    const finalMessage = message || this.message;
    process.stdout.write(`\r❌ ${finalMessage}\n`);
    // Show cursor
    process.stdout.write('\x1B[?25h');
  }

  warn(message?: string): void {
    this.stop();
    const finalMessage = message || this.message;
    process.stdout.write(`\r⚠️  ${finalMessage}\n`);
    // Show cursor
    process.stdout.write('\x1B[?25h');
  }

  stop(): void {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    // Clear the current line
    process.stdout.write('\r\x1B[K');
  }
}

export function withProgress<T>(
  message: string,
  operation: (progress: ProgressIndicator) => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const progress = new ProgressIndicator(message);
    progress.start();

    try {
      const result = await operation(progress);
      progress.succeed();
      resolve(result);
    } catch (error) {
      progress.fail();
      reject(error);
    }
  });
}

export const progressFrames = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  bounce: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
  pulse: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  simple: ['|', '/', '-', '\\'],
  emoji: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
};
