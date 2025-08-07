import type { Config } from '../types/config.js';

export interface DiffItem {
  path: string;
  old: unknown;
  new: unknown;
  type: 'added' | 'modified' | 'removed';
}

/**
 * Strip secrets from configuration object
 * Removes or masks fields matching /key|token|secret/i pattern
 */
export function stripSecrets<T extends Record<string, any>>(config: T): T {
  const stripped = JSON.parse(JSON.stringify(config)); // Deep clone

  function stripRecursive(obj: any, path: string = ''): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;

      // Check if key matches secret pattern
      if (/key|token|secret|password/i.test(key)) {
        if (typeof value === 'string' && value.length > 0) {
          // Mask the value but show it exists
          obj[key] = '***REDACTED***';
        }
      } else if (typeof value === 'object' && value !== null) {
        stripRecursive(value, fullPath);
      }
    }
  }

  stripRecursive(stripped);
  return stripped;
}

/**
 * Create minimal configuration with only essential fields
 */
export function createMinimalConfig(config: Config): Partial<Config> {
  return {
    version: config.version,
    commitTypes: config.commitTypes,
    emojiEnabled: config.emojiEnabled,
    conventionalCommits: config.conventionalCommits,
    maxSubjectLength: config.maxSubjectLength,
    maxBodyLength: config.maxBodyLength
  };
}

/**
 * Compare two configuration objects and return differences
 */
export function createDiff(oldConfig: Config, newConfig: Config): DiffItem[] {
  const diff: DiffItem[] = [];

  function compareObjects(oldObj: any, newObj: any, path: string = ''): void {
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    for (const key of allKeys) {
      const fullPath = path ? `${path}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      if (oldValue === undefined && newValue !== undefined) {
        // Added
        diff.push({
          path: fullPath,
          old: undefined,
          new: newValue,
          type: 'added'
        });
      } else if (oldValue !== undefined && newValue === undefined) {
        // Removed
        diff.push({
          path: fullPath,
          old: oldValue,
          new: undefined,
          type: 'removed'
        });
      } else if (oldValue !== newValue) {
        // Check if both are objects for deep comparison
        if (
          typeof oldValue === 'object' &&
          typeof newValue === 'object' &&
          oldValue !== null &&
          newValue !== null &&
          !Array.isArray(oldValue) &&
          !Array.isArray(newValue)
        ) {
          // Recursively compare objects
          compareObjects(oldValue, newValue, fullPath);
        } else {
          // Value changed
          diff.push({
            path: fullPath,
            old: oldValue,
            new: newValue,
            type: 'modified'
          });
        }
      }
    }
  }

  compareObjects(oldConfig, newConfig);
  return diff;
}

/**
 * Format a diff item for display
 */
export function formatDiffItem(item: DiffItem): string {
  const formatValue = (value: unknown): string => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  switch (item.type) {
    case 'added':
      return `+ ${item.path}: ${formatValue(item.new)}`;
    case 'removed':
      return `- ${item.path}: ${formatValue(item.old)}`;
    case 'modified':
      return `~ ${item.path}: ${formatValue(item.old)} → ${formatValue(item.new)}`;
    default:
      return `? ${item.path}: Unknown change`;
  }
}

/**
 * Check if two configs are essentially the same (ignoring minor differences)
 */
export function areConfigsEqual(config1: Config, config2: Config): boolean {
  const diff = createDiff(config1, config2);
  return diff.length === 0;
}

/**
 * Validate configuration version compatibility
 */
export function validateConfigVersion(config: any): { valid: boolean; message: string } {
  if (!config.version) {
    return {
      valid: false,
      message: 'Configuration is missing version field. This config may be incompatible.'
    };
  }

  if (config.version !== '1.0') {
    return {
      valid: false,
      message: `Configuration version "${config.version}" is not supported. Expected version "1.0".`
    };
  }

  return {
    valid: true,
    message: 'Configuration version is compatible.'
  };
}

/**
 * Get summary statistics about a diff
 */
export function getDiffSummary(diff: DiffItem[]): {
  added: number;
  modified: number;
  removed: number;
  total: number;
} {
  const summary = {
    added: 0,
    modified: 0,
    removed: 0,
    total: diff.length
  };

  for (const item of diff) {
    summary[item.type]++;
  }

  return summary;
}
