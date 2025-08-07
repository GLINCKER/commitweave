/**
 * Lazy import utility for performance optimization
 * Provides Promise-based dynamic loading with future caching capability
 */

const importCache = new Map<string, Promise<any>>();

/**
 * Lazy import wrapper for dynamic module loading
 * @param factory Function that returns a Promise for the module import
 * @returns Promise resolving to the imported module
 */
export async function lazy<T>(factory: () => Promise<T>): Promise<T> {
  return factory();
}

/**
 * Cached lazy import for better performance on repeated imports
 * @param key Cache key for the import
 * @param factory Function that returns a Promise for the module import
 * @returns Promise resolving to the cached or newly imported module
 */
export async function lazyCached<T>(key: string, factory: () => Promise<T>): Promise<T> {
  if (!importCache.has(key)) {
    importCache.set(key, factory());
  }
  return importCache.get(key)!;
}

/**
 * Clear the import cache (useful for testing)
 */
export function clearImportCache(): void {
  importCache.clear();
}
