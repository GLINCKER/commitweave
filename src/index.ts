// Main exports for the library
export * from './core/commitBuilder.js';
export * from './utils/git.js';
export * from './utils/ai.js';
export * from './types/index.js';

// Re-export specific items from config to avoid conflicts
export { defaultCommitTypes, defaultConfig, getCommitTypeByAlias } from './config/defaultConfig.js';
