/**
 * Performance measurement utilities for CommitWeave
 * Tracks startup time and provides debugging output
 */

const start = process.hrtime.bigint();

/**
 * Get milliseconds since module load
 * @returns Time in milliseconds since this module was first imported
 */
export function sinceStart(): number {
  return Number(process.hrtime.bigint() - start) / 1e6; // Convert nanoseconds to milliseconds
}

/**
 * Report performance metrics if debug flag is enabled
 * Controlled by COMMITWEAVE_DEBUG_PERF environment variable
 */
export function maybeReport(): void {
  if (process.env.COMMITWEAVE_DEBUG_PERF === "1") {
    // eslint-disable-next-line no-console
    console.log(`⚡ cold-start: ${sinceStart().toFixed(1)} ms`);
  }
}

/**
 * Create a performance mark for measuring specific operations
 * @param name Name of the operation being measured
 * @returns Function to call when the operation completes
 */
export function mark(name: string): () => void {
  const markStart = process.hrtime.bigint();
  
  return () => {
    if (process.env.COMMITWEAVE_DEBUG_PERF === "1") {
      const duration = Number(process.hrtime.bigint() - markStart) / 1e6;
      // eslint-disable-next-line no-console
      console.log(`⏱️  ${name}: ${duration.toFixed(1)} ms`);
    }
  };
}

/**
 * Measure execution time of an async function
 * @param name Name of the operation
 * @param fn Function to measure
 * @returns Result of the function
 */
export async function measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const end = mark(name);
  try {
    const result = await fn();
    end();
    return result;
  } catch (error) {
    end();
    throw error;
  }
}